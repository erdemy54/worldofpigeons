/**
 * World of Pigeon's — Economy System
 * 3 currencies, purchasing, market valuation, transactions.
 * Depends on: EventBus, ItemsDB, GeneticsSystem
 */
(function () {
  'use strict';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ─────────────── wallet state ─────────────── */

  const wallet = {
    feedMoney: 5000,
    tokens:    20,
    diamonds:  5
  };

  const CURRENCY_NAMES = {
    feedMoney: 'Feed Money',
    tokens:    'Tokens',
    diamonds:  'Diamonds'
  };

  const transactionLog = [];   // { id, type, currency, amount, description, timestamp }

  /* ─────────────── currency helpers ─────────────── */

  function getWallet() {
    return Object.assign({}, wallet);
  }

  function addCurrency(currency, amount) {
    if (!(currency in wallet)) throw new Error('Unknown currency: ' + currency);
    if (amount <= 0) throw new Error('Amount must be positive');
    wallet[currency] += amount;
    _log('credit', currency, amount, 'Added ' + amount + ' ' + CURRENCY_NAMES[currency]);
    if (window.EventBus) {
      window.EventBus.emit('economy:currencyAdded', { currency: currency, amount: amount, balance: wallet[currency] });
    }
    return wallet[currency];
  }

  function spendCurrency(currency, amount) {
    if (!(currency in wallet)) throw new Error('Unknown currency: ' + currency);
    if (amount <= 0) throw new Error('Amount must be positive');
    if (wallet[currency] < amount) {
      return { success: false, reason: 'Insufficient ' + CURRENCY_NAMES[currency] + '. Need ' + amount + ', have ' + wallet[currency] + '.' };
    }
    wallet[currency] -= amount;
    _log('debit', currency, amount, 'Spent ' + amount + ' ' + CURRENCY_NAMES[currency]);
    if (window.EventBus) {
      window.EventBus.emit('economy:currencySpent', { currency: currency, amount: amount, balance: wallet[currency] });
    }
    return { success: true, balance: wallet[currency] };
  }

  function canAfford(currency, amount) {
    if (!(currency in wallet)) return false;
    return wallet[currency] >= amount;
  }

  /* ─────────────── item purchasing ─────────────── */

  /**
   * purchaseItem(itemId, quantity)
   * Looks up item in ItemsDB, checks affordability, deducts cost.
   */
  function purchaseItem(itemId, quantity) {
    quantity = quantity || 1;
    const item = (window.ItemsDB && window.ItemsDB[itemId]) || null;
    if (!item) return { success: false, reason: 'Unknown item: ' + itemId };

    const currency   = item.currency || 'feedMoney';
    const totalPrice = (item.price || 0) * quantity;

    if (!canAfford(currency, totalPrice)) {
      return { success: false, reason: 'Cannot afford ' + quantity + 'x ' + (item.name || itemId) + ' (' + totalPrice + ' ' + CURRENCY_NAMES[currency] + ').' };
    }

    const result = spendCurrency(currency, totalPrice);
    if (!result.success) return result;

    _log('purchase', currency, totalPrice, 'Purchased ' + quantity + 'x ' + (item.name || itemId));

    if (window.EventBus) {
      window.EventBus.emit('economy:itemPurchased', { itemId: itemId, quantity: quantity, totalPrice: totalPrice, currency: currency });
    }

    return { success: true, itemId: itemId, quantity: quantity, totalPrice: totalPrice, balance: wallet[currency] };
  }

  /* ─────────────── market valuation ─────────────── */

  /**
   * getMarketValue(pigeon) → Number (in feedMoney)
   *
   * Value formula:
   *   base = gradeMultiplier * 500
   *   statBonus = avg(stat caps) * 10
   *   rarityBonus: rare color +500, rare trait +200 each
   *   generationBonus = max(0, 5 - generation) * 100
   *   conditionFactor = condition / 100
   */
  function getMarketValue(pigeon) {
    if (!pigeon) return 0;

    const GRADE_MULT = {
      'B': 1.0, 'B+': 1.5, 'A': 2.5, 'S': 5.0, 'SS': 10.0, 'SSR': 25.0
    };

    const mult = GRADE_MULT[pigeon.grade] || 1.0;
    let base = mult * 500;

    // stat bonus
    const STATS = (window.GeneticsSystem && window.GeneticsSystem.STAT_NAMES) ||
                  ['speed','endurance','agility','intelligence','strength','charisma'];
    let sumCap = 0;
    for (const s of STATS) {
      sumCap += (pigeon.stats[s] && pigeon.stats[s].cap) || 0;
    }
    const avgCap = sumCap / STATS.length;
    const statBonus = avgCap * 10;

    // rarity bonus
    let rarityBonus = 0;
    const RARE_COLORS = ['silver', 'gold', 'albino', 'iridescent'];
    if (pigeon.genetics && pigeon.genetics.color && RARE_COLORS.indexOf(pigeon.genetics.color.phenotype) !== -1) {
      rarityBonus += 500;
    }
    // rare traits
    if (pigeon.genetics) {
      if (pigeon.genetics.crest && pigeon.genetics.crest.phenotype === 'crest') rarityBonus += 200;
      if (pigeon.genetics.featheredFeet && pigeon.genetics.featheredFeet.phenotype === 'feathered') rarityBonus += 200;
      if (pigeon.genetics.chestFrill && pigeon.genetics.chestFrill.phenotype === 'frill') rarityBonus += 200;
    }

    // generation bonus
    const genBonus = Math.max(0, 5 - (pigeon.generation || 0)) * 100;

    // condition factor
    const condFactor = clamp((pigeon.condition || 100) / 100, 0.3, 1.0);

    const total = Math.round((base + statBonus + rarityBonus + genBonus) * condFactor);
    return total;
  }

  /* ─────────────── transactions ─────────────── */

  /**
   * processTransaction(sellerId, buyerId, amount, currency)
   * Applies a 5 % transaction fee.
   */
  function processTransaction(sellerId, buyerId, amount, currency) {
    currency = currency || 'feedMoney';
    if (amount <= 0) return { success: false, reason: 'Invalid amount.' };

    const fee     = Math.ceil(amount * 0.05);
    const netPay  = amount - fee;

    _log('transaction', currency, amount, 'TX ' + sellerId + ' → ' + buyerId + ' | gross=' + amount + ' fee=' + fee + ' net=' + netPay);

    if (window.EventBus) {
      window.EventBus.emit('economy:transaction', {
        sellerId: sellerId,
        buyerId: buyerId,
        grossAmount: amount,
        fee: fee,
        netAmount: netPay,
        currency: currency,
        timestamp: Date.now()
      });
    }

    return {
      success: true,
      grossAmount: amount,
      fee: fee,
      netAmount: netPay,
      currency: currency
    };
  }

  /* ─────────────── exchange rates ─────────────── */

  /**
   * Simple currency conversion helper (one-way feedMoney → tokens, tokens → diamonds)
   */
  const EXCHANGE_RATES = {
    feedMoneyToTokens:  500,   // 500 feedMoney = 1 token
    tokensToDiamonds:   10     // 10 tokens = 1 diamond
  };

  function exchangeCurrency(fromCurrency, toCurrency, fromAmount) {
    if (fromCurrency === 'feedMoney' && toCurrency === 'tokens') {
      const tokensGained = Math.floor(fromAmount / EXCHANGE_RATES.feedMoneyToTokens);
      if (tokensGained < 1) return { success: false, reason: 'Not enough feedMoney for conversion.' };
      const cost = tokensGained * EXCHANGE_RATES.feedMoneyToTokens;
      const r = spendCurrency('feedMoney', cost);
      if (!r.success) return r;
      addCurrency('tokens', tokensGained);
      return { success: true, spent: cost, gained: tokensGained, from: 'feedMoney', to: 'tokens' };
    }
    if (fromCurrency === 'tokens' && toCurrency === 'diamonds') {
      const diamondsGained = Math.floor(fromAmount / EXCHANGE_RATES.tokensToDiamonds);
      if (diamondsGained < 1) return { success: false, reason: 'Not enough tokens for conversion.' };
      const cost = diamondsGained * EXCHANGE_RATES.tokensToDiamonds;
      const r = spendCurrency('tokens', cost);
      if (!r.success) return r;
      addCurrency('diamonds', diamondsGained);
      return { success: true, spent: cost, gained: diamondsGained, from: 'tokens', to: 'diamonds' };
    }
    return { success: false, reason: 'Unsupported exchange pair.' };
  }

  /* ─────────────── internal helpers ─────────────── */

  function _log(type, currency, amount, description) {
    transactionLog.push({
      id: 'tx_' + Date.now().toString(36),
      type: type,
      currency: currency,
      amount: amount,
      description: description,
      timestamp: Date.now()
    });
    // keep last 500 entries
    if (transactionLog.length > 500) transactionLog.shift();
  }

  function getTransactionLog(count) {
    count = count || 50;
    return transactionLog.slice(-count);
  }

  /* ─────────────── public API ─────────────── */

  window.EconomySystem = {
    getWallet:          getWallet,
    addCurrency:        addCurrency,
    spendCurrency:      spendCurrency,
    canAfford:          canAfford,
    purchaseItem:       purchaseItem,
    getMarketValue:     getMarketValue,
    processTransaction: processTransaction,
    exchangeCurrency:   exchangeCurrency,
    getTransactionLog:  getTransactionLog,
    CURRENCY_NAMES:     CURRENCY_NAMES,
    EXCHANGE_RATES:     EXCHANGE_RATES
  };

})();
