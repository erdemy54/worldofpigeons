/* ============================================================
   js/systems/market.js — Market System Logic
   Dynamic pricing, P2P simulation, transaction fees
   ============================================================ */
window.MarketSystem = (function () {
    'use strict';

    const TRANSACTION_FEE = 0.05; // 5%

    // NPC market listings (simulated P2P)
    function generateListings(playerLevel) {
        const listings = [];
        const level = playerLevel || 1;
        const breedIds = window.BreedsDB ? window.BreedsDB.getAllBreedIds() : ['turk_taklacisi'];

        // Generate 3-6 pigeon listings
        const count = Math.floor(Math.random() * 4) + 3;
        for (let i = 0; i < count; i++) {
            // Filter available breeds by tier based on player level
            const availableBreeds = breedIds.filter(id => {
                const breed = window.BreedsDB ? window.BreedsDB.getBreed(id) : null;
                if (!breed) return false;
                const tierIdx = ['B', 'B+', 'A', 'A+', 'S', 'S+', 'SS', 'SS+', 'SSR'].indexOf(breed.tier);
                return tierIdx <= Math.floor(level / 3) + 2;
            });

            const breedId = availableBreeds[Math.floor(Math.random() * availableBreeds.length)] || 'turk_taklacisi';

            if (window.GeneticsSystem) {
                const pigeon = window.GeneticsSystem.createPigeon(breedId, {
                    gender: Math.random() > 0.5 ? 'male' : 'female'
                });
                const price = calculatePigeonPrice(pigeon);

                listings.push({
                    pigeon,
                    price,
                    currency: price > 5000 ? 'tokens' : 'feedMoney',
                    sellerName: generateSellerName()
                });
            }
        }

        return listings;
    }

    function calculatePigeonPrice(pigeon) {
        const qi = pigeon.qi || 0;
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const tierMultiplier = {
            'B': 1, 'B+': 1.5, 'A': 2.5, 'A+': 4, 'S': 8, 'S+': 12, 'SS': 25, 'SS+': 50, 'SSR': 100
        };
        const mult = breed ? (tierMultiplier[breed.tier] || 1) : 1;

        return Math.round((qi * 30 + 500) * mult);
    }

    function applyFee(amount) {
        return Math.round(amount * (1 - TRANSACTION_FEE));
    }

    function generateSellerName() {
        const names = ['Ahmet', 'Mehmet', 'Ali', 'Hasan', 'Hüseyin', 'Fatma', 'Ayşe', 'Mustafa', 'Ömer', 'İbrahim'];
        const suffixes = ['Usta', 'Abi', 'Amca', 'Dayı', 'Hoca'];
        return `${names[Math.floor(Math.random() * names.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }

    return { generateListings, calculatePigeonPrice, applyFee, TRANSACTION_FEE };
})();
