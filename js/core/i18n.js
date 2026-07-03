/**
 * World of Pigeon's - Internationalization System
 * Bilingual support: Turkish (tr) + English (en)
 * Uses window.I18n global with dot notation key access
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'wop_language';
  var DEFAULT_LANG = 'tr';

  var translations = {
    tr: {
      // ── Navigation ──
      nav: {
        coop: 'Kümes',
        flight: 'Uçuş',
        flock: 'Sürü',
        market: 'Pazar',
        more: 'Daha Fazla',
        settings: 'Ayarlar',
        quests: 'Görevler',
        competitions: 'Yarışmalar',
        breeding: 'Üretim',
        inventory: 'Envanter',
        achievements: 'Başarılar',
        leaderboard: 'Sıralama',
        encyclopedia: 'Ansiklopedi',
        profile: 'Profil',
        back: 'Geri',
        home: 'Ana Sayfa'
      },

      // ── Loading Screen ──
      loading: {
        title: 'Güvercin Dünyası',
        subtitle: 'Yükleniyor...',
        tip_1: 'Güvercinlerinizi düzenli besleyin!',
        tip_2: 'Takla eğitimi sabır gerektirir.',
        tip_3: 'Nadir ırklar pazarda çok değerlidir.',
        tip_4: 'Hastalıklara dikkat edin!',
        tip_5: 'Sürü senkronizasyonu yarışmalarda önemlidir.',
        tip_6: 'Genetik çeşitlilik güçlü yavrular üretir.',
        ready: 'Hazır!',
        tap_to_start: 'Başlamak için dokun',
        loading_assets: 'Kaynaklar yükleniyor...',
        loading_save: 'Kayıt yükleniyor...',
        loading_audio: 'Ses sistemi hazırlanıyor...'
      },

      // ── Settings ──
      settings: {
        title: 'Ayarlar',
        language: 'Dil',
        sound: 'Ses',
        music: 'Müzik',
        sfx: 'Ses Efektleri',
        notifications: 'Bildirimler',
        save: 'Kaydet',
        load: 'Yükle',
        reset: 'Sıfırla',
        confirm_reset: 'Tüm ilerlemeniz silinecek. Emin misiniz?',
        volume: 'Ses Seviyesi',
        vibration: 'Titreşim',
        dark_mode: 'Karanlık Mod',
        language_tr: 'Türkçe',
        language_en: 'English',
        auto_save: 'Otomatik Kayıt',
        graphics_quality: 'Grafik Kalitesi',
        low: 'Düşük',
        medium: 'Orta',
        high: 'Yüksek'
      },

      // ── Breeds ──
      breeds: {
        turk_taklacisi: 'Türk Taklacısı',
        sivas_taklacisi: 'Sivas Taklacısı',
        kayseri_taklacisi: 'Kayseri Taklacısı',
        kelebek: 'Kelebek',
        sanliurfa_taklacisi: 'Şanlıurfa Taklacısı',
        mardin_guvercini: 'Mardin Güvercini',
        filo_guvercini: 'Filo Güvercini',
        posta_guvercini: 'Posta Güvercini',
        ankut_guvercini: 'Ankut Güvercini',
        misiri: 'Mısıri'
      },

      // ── Breed Descriptions ──
      breed_desc: {
        turk_taklacisi: 'Havada zarif taklalar atan geleneksel Türk güvercini.',
        sivas_taklacisi: 'Sivas yöresine özgü, yüksek dayanıklılıkta taklacı.',
        kayseri_taklacisi: 'Kayseri bölgesinin gözde taklacı ırkı.',
        kelebek: 'Kelebek kanat hareketleriyle bilinen zarif ırk.',
        sanliurfa_taklacisi: 'Güneydoğu\'nun sıcağına dayanıklı taklacı.',
        mardin_guvercini: 'Mardin\'in tarihi sokaklarında yetiştirilen asil ırk.',
        filo_guvercini: 'Sürü uçuşunda mükemmel koordinasyon sergiler.',
        posta_guvercini: 'Uzun mesafe yön bulma yeteneğiyle ünlü.',
        ankut_guvercini: 'Anadolu\'nun sert iklimine dayanıklı güçlü ırk.',
        misiri: 'Mısır kökenli, egzotik görünümlü güvercin.'
      },

      // ── Breed Families ──
      breed_families: {
        taklaci: 'Taklacı',
        seyyah: 'Seyyah',
        gosteri: 'Gösteri',
        posta: 'Posta',
        suruculu: 'Sürücülü',
        label: 'Aile',
        description: 'Irk Ailesi'
      },

      // ── Stats ──
      stats: {
        tumble: 'Takla',
        spin_speed: 'Dönüş Hızı',
        style: 'Stil',
        balance: 'Denge',
        endurance: 'Dayanıklılık',
        flock_sync: 'Sürü Senkronizasyonu',
        health: 'Sağlık',
        happiness: 'Mutluluk',
        hunger: 'Açlık',
        energy: 'Enerji',
        experience: 'Deneyim',
        level: 'Seviye',
        age: 'Yaş',
        weight: 'Ağırlık',
        speed: 'Hız',
        agility: 'Çeviklik',
        charisma: 'Karizma',
        intelligence: 'Zeka',
        total_power: 'Toplam Güç',
        base: 'Temel',
        bonus: 'Bonus',
        modifier: 'Düzenleyici'
      },

      // ── Tiers ──
      tiers: {
        B: 'B',
        A: 'A',
        S: 'S',
        SS: 'SS',
        SSR: 'SSR',
        label: 'Kalite',
        desc_B: 'Yaygın kalite',
        desc_A: 'İyi kalite',
        desc_S: 'Nadir kalite',
        desc_SS: 'Efsanevi kalite',
        desc_SSR: 'Efsane ötesi kalite'
      },

      // ── Diseases ──
      diseases: {
        avian_pox: 'Kuş Çiçeği',
        newcastle: 'Newcastle Hastalığı',
        salmonella: 'Salmonella',
        canker: 'Kanker',
        respiratory: 'Solunum Enfeksiyonu',
        parasites: 'Parazitler',
        label: 'Hastalık',
        infected: 'Enfekte',
        healthy: 'Sağlıklı',
        recovering: 'İyileşiyor',
        critical: 'Kritik',
        treatment: 'Tedavi',
        quarantine: 'Karantina',
        symptoms: 'Belirtiler',
        cure: 'İyileştir',
        prevention: 'Önleme'
      },

      // ── Threats ──
      threats: {
        hawk: 'Atmaca',
        cat: 'Kedi',
        storm: 'Fırtına',
        heatwave: 'Sıcak Dalgası',
        disease_outbreak: 'Salgın',
        theft: 'Hırsızlık',
        label: 'Tehdit',
        warning: 'Uyarı! Tehdit tespit edildi!',
        safe: 'Güvende',
        danger: 'Tehlike',
        protect: 'Koru',
        evade: 'Kaçın'
      },

      // ── Tricks ──
      tricks: {
        single_tumble: 'Tekli Takla',
        double_tumble: 'Çiftli Takla',
        chain_tumble: 'Zincirleme Takla',
        barrel_roll: 'Fıçı Dönüşü',
        wing_clap: 'Kanat Çırpma',
        diving_spiral: 'Dalış Spirali',
        sky_dance: 'Gökyüzü Dansı',
        thunder_drop: 'Şimşek Düşüşü',
        label: 'Numara',
        locked: 'Kilitli',
        unlocked: 'Açık',
        mastered: 'Ustalaşmış',
        practice: 'Pratik Yap',
        perform: 'Göster',
        difficulty: 'Zorluk'
      },

      // ── Currencies ──
      currency: {
        coins: 'Altın',
        gems: 'Elmas',
        feathers: 'Tüy',
        reputation: 'İtibar',
        tickets: 'Bilet',
        feed_token: 'Yem Jetonu',
        premium: 'Premium',
        free: 'Ücretsiz'
      },

      // ── Lifecycle Stages ──
      lifecycle: {
        egg: 'Yumurta',
        chick: 'Vizzik',
        juvenile: 'Mukluf',
        adult: 'Anaç',
        elder: 'Yaşlı',
        egg_desc: 'Kuluçka aşamasında',
        chick_desc: 'Yeni doğmuş yavru güvercin',
        juvenile_desc: 'Genç ve öğrenmeye hazır',
        adult_desc: 'Tam olgunluğa ulaşmış',
        elder_desc: 'Deneyimli ve bilge',
        hatching: 'Yumurtadan Çıkma',
        growing: 'Büyüme',
        maturity: 'Olgunluk',
        days_remaining: 'Kalan Gün',
        incubation: 'Kuluçka',
        incubation_time: 'Kuluçka Süresi'
      },

      // ── Actions ──
      actions: {
        feed: 'Besle',
        breed: 'Çiftleştir',
        train: 'Eğit',
        heal: 'İyileştir',
        sell: 'Sat',
        buy: 'Satın Al',
        collect: 'Topla',
        upgrade: 'Yükselt',
        equip: 'Kuşan',
        unequip: 'Çıkar',
        discard: 'At',
        gift: 'Hediye Et',
        release: 'Serbest Bırak',
        inspect: 'İncele',
        rename: 'Yeniden Adlandır',
        select: 'Seç',
        cancel: 'İptal',
        confirm: 'Onayla',
        close: 'Kapat',
        open: 'Aç',
        claim: 'Talep Et',
        skip: 'Atla',
        retry: 'Tekrar Dene',
        start: 'Başla',
        stop: 'Durdur',
        pause: 'Duraklat',
        resume: 'Devam Et'
      },

      // ── Quest Types ──
      quests: {
        daily: 'Günlük Görev',
        weekly: 'Haftalık Görev',
        story: 'Hikaye Görevi',
        challenge: 'Meydan Okuma',
        tutorial: 'Eğitim Görevi',
        special: 'Özel Görev',
        completed: 'Tamamlandı',
        in_progress: 'Devam Ediyor',
        not_started: 'Başlanmadı',
        reward: 'Ödül',
        objective: 'Hedef',
        progress: 'İlerleme',
        expired: 'Süresi Doldu',
        new_quest: 'Yeni Görev!',
        quest_complete: 'Görev Tamamlandı!',
        claim_reward: 'Ödülü Al'
      },

      // ── Competition Types ──
      competitions: {
        tumble_contest: 'Takla Yarışması',
        speed_race: 'Hız Yarışı',
        style_show: 'Stil Gösterisi',
        endurance_flight: 'Dayanıklılık Uçuşu',
        flock_display: 'Sürü Gösterisi',
        championship: 'Şampiyona',
        tournament: 'Turnuva',
        league: 'Lig',
        rank: 'Sıra',
        score: 'Puan',
        winner: 'Kazanan',
        loser: 'Kaybeden',
        draw: 'Berabere',
        round: 'Tur',
        finals: 'Final',
        enter: 'Katıl',
        entry_fee: 'Giriş Ücreti',
        prize: 'Ödül',
        matchmaking: 'Eşleşme...',
        opponent: 'Rakip',
        victory: 'Zafer!',
        defeat: 'Yenilgi'
      },

      // ── Breeding Terms ──
      breeding: {
        pair: 'Çift',
        male: 'Erkek',
        female: 'Dişi',
        offspring: 'Yavru',
        genetics: 'Genetik',
        bloodline: 'Soy',
        generation: 'Nesil',
        pedigree: 'Soy Ağacı',
        compatibility: 'Uyumluluk',
        fertility: 'Doğurganlık',
        mutation: 'Mutasyon',
        trait: 'Özellik',
        dominant: 'Baskın',
        recessive: 'Çekinik',
        inherited: 'Kalıtsal',
        hybrid: 'Melez',
        purebred: 'Safkan',
        lineage: 'Soy Hattı',
        select_male: 'Erkek Seç',
        select_female: 'Dişi Seç',
        breed_pair: 'Çiftleştir',
        breeding_time: 'Çiftleşme Süresi',
        success_rate: 'Başarı Oranı',
        gene_pool: 'Gen Havuzu',
        inbreeding: 'Akraba Çiftleşmesi',
        crossbreed: 'Melezleme',
        hatch_chance: 'Kuluçka Şansı'
      },

      // ── Genetic Terms ──
      genetics: {
        allele: 'Alel',
        genotype: 'Genotip',
        phenotype: 'Fenotip',
        chromosome: 'Kromozom',
        gene: 'Gen',
        dna: 'DNA',
        inheritance: 'Kalıtım',
        variation: 'Varyasyon',
        selection: 'Seçilim',
        mutation_chance: 'Mutasyon Şansı',
        rare_gene: 'Nadir Gen',
        gene_strength: 'Gen Gücü'
      },

      // ── Onboarding ──
      onboarding: {
        welcome: 'Güvercin Dünyasına Hoş Geldiniz!',
        step_1: 'Bu sizin kümesiniz. Güvercinleriniz burada yaşar.',
        step_2: 'İlk güvercininizi besleyin.',
        step_3: 'Güvercinlerinizi eğiterek taklalar öğretin.',
        step_4: 'Uçuş alanına giderek güvercinlerinizi uçurun.',
        step_5: 'Pazarda güvercin alıp satabilirsiniz.',
        step_6: 'Yarışmalara katılarak ödüller kazanın!',
        step_7: 'Çiftleştirme ile yeni güvercinler üretin.',
        skip_tutorial: 'Eğitimi Atla',
        next: 'İleri',
        previous: 'Geri',
        got_it: 'Anladım!',
        tip: 'İpucu',
        first_pigeon: 'İlk güvercininiz: bir Türk Taklacısı!',
        name_your_pigeon: 'Güvercininize bir isim verin',
        congratulations: 'Tebrikler! Artık bir güvercin ustasısınız!'
      },

      // ── Toast Messages ──
      toast: {
        save_success: 'Oyun kaydedildi!',
        save_error: 'Kaydetme hatası!',
        load_success: 'Oyun yüklendi!',
        load_error: 'Yükleme hatası!',
        purchase_success: 'Satın alma başarılı!',
        purchase_fail: 'Yetersiz bakiye!',
        sell_success: 'Satış başarılı!',
        feed_success: 'Güvercin beslendi!',
        feed_no_food: 'Yem yok!',
        train_success: 'Eğitim tamamlandı!',
        train_tired: 'Güvercin çok yorgun!',
        heal_success: 'Güvercin iyileştirildi!',
        heal_not_sick: 'Güvercin zaten sağlıklı.',
        breed_success: 'Yeni yumurta!',
        breed_fail: 'Çiftleşme başarısız.',
        breed_incompatible: 'Bu güvercinler uyumsuz.',
        level_up: 'Seviye atladı!',
        new_trick: 'Yeni numara öğrenildi!',
        competition_win: 'Yarışmayı kazandınız!',
        competition_lose: 'Yarışmayı kaybettiniz.',
        quest_complete: 'Görev tamamlandı!',
        egg_hatched: 'Yumurta çatladı!',
        pigeon_grew: 'Güvercin büyüdü!',
        threat_warning: 'Dikkat! Tehdit tespit edildi!',
        disease_warning: 'Güvercin hastalandı!',
        offline_earnings: 'Çevrimdışı kazancınız:',
        coop_full: 'Kümes dolu!',
        connection_error: 'Bağlantı hatası!',
        generic_error: 'Bir hata oluştu.',
        copied: 'Kopyalandı!',
        renamed: 'İsim değiştirildi!',
        released: 'Güvercin serbest bırakıldı.',
        insufficient_energy: 'Yetersiz enerji!',
        max_level: 'Maksimum seviye!',
        reward_claimed: 'Ödül alındı!'
      },

      // ── Market Labels ──
      market: {
        title: 'Pazar',
        buy_tab: 'Satın Al',
        sell_tab: 'Sat',
        auction: 'Müzayede',
        price: 'Fiyat',
        quantity: 'Adet',
        total: 'Toplam',
        discount: 'İndirim',
        sold_out: 'Tükendi',
        new_stock: 'Yeni Stok',
        featured: 'Öne Çıkan',
        rare: 'Nadir',
        limited: 'Sınırlı',
        best_seller: 'Çok Satan',
        search: 'Ara...',
        filter: 'Filtrele',
        sort_price: 'Fiyata Göre',
        sort_rarity: 'Nadirliğe Göre',
        sort_name: 'İsme Göre',
        category_pigeons: 'Güvercinler',
        category_feed: 'Yem',
        category_medicine: 'İlaç',
        category_equipment: 'Ekipman',
        category_decorations: 'Dekorasyon',
        confirm_purchase: 'Satın almak istiyor musunuz?',
        confirm_sell: 'Satmak istiyor musunuz?',
        no_items: 'Ürün bulunamadı.',
        your_balance: 'Bakiyeniz'
      },

      // ── Flight / Coop ──
      flight: {
        title: 'Uçuş Alanı',
        launch: 'Uçur',
        land: 'İndir',
        altitude: 'Yükseklik',
        wind: 'Rüzgar',
        weather: 'Hava Durumu',
        sunny: 'Güneşli',
        cloudy: 'Bulutlu',
        rainy: 'Yağmurlu',
        windy: 'Rüzgarlı',
        duration: 'Süre',
        performance: 'Performans',
        flight_log: 'Uçuş Kaydı'
      },

      coop: {
        title: 'Kümes',
        capacity: 'Kapasite',
        empty_slot: 'Boş Yuva',
        upgrade_coop: 'Kümesi Yükselt',
        cleanliness: 'Temizlik',
        temperature: 'Sıcaklık',
        clean: 'Temizle',
        feed_all: 'Hepsini Besle'
      },

      // ── Time / General ──
      time: {
        day: 'Gün',
        night: 'Gece',
        dawn: 'Şafak',
        dusk: 'Alacakaranlık',
        morning: 'Sabah',
        afternoon: 'Öğleden Sonra',
        evening: 'Akşam',
        speed: 'Hız',
        paused: 'Duraklatıldı'
      },

      general: {
        yes: 'Evet',
        no: 'Hayır',
        ok: 'Tamam',
        name: 'İsim',
        description: 'Açıklama',
        details: 'Detaylar',
        info: 'Bilgi',
        warning: 'Uyarı',
        error: 'Hata',
        success: 'Başarılı',
        loading: 'Yükleniyor...',
        empty: 'Boş',
        locked: 'Kilitli',
        unlocked: 'Açık',
        max: 'Maks',
        min: 'Min',
        total: 'Toplam',
        average: 'Ortalama',
        percent: '%',
        none: 'Yok',
        all: 'Tümü',
        or: 'veya',
        and: 've'
      }
    },

    en: {
      // ── Navigation ──
      nav: {
        coop: 'Coop',
        flight: 'Flight',
        flock: 'Flock',
        market: 'Market',
        more: 'More',
        settings: 'Settings',
        quests: 'Quests',
        competitions: 'Competitions',
        breeding: 'Breeding',
        inventory: 'Inventory',
        achievements: 'Achievements',
        leaderboard: 'Leaderboard',
        encyclopedia: 'Encyclopedia',
        profile: 'Profile',
        back: 'Back',
        home: 'Home'
      },

      // ── Loading Screen ──
      loading: {
        title: 'World of Pigeons',
        subtitle: 'Loading...',
        tip_1: 'Feed your pigeons regularly!',
        tip_2: 'Tumble training requires patience.',
        tip_3: 'Rare breeds are very valuable at the market.',
        tip_4: 'Watch out for diseases!',
        tip_5: 'Flock synchronization matters in competitions.',
        tip_6: 'Genetic diversity produces stronger offspring.',
        ready: 'Ready!',
        tap_to_start: 'Tap to start',
        loading_assets: 'Loading assets...',
        loading_save: 'Loading save...',
        loading_audio: 'Preparing audio...'
      },

      // ── Settings ──
      settings: {
        title: 'Settings',
        language: 'Language',
        sound: 'Sound',
        music: 'Music',
        sfx: 'Sound Effects',
        notifications: 'Notifications',
        save: 'Save',
        load: 'Load',
        reset: 'Reset',
        confirm_reset: 'All progress will be deleted. Are you sure?',
        volume: 'Volume',
        vibration: 'Vibration',
        dark_mode: 'Dark Mode',
        language_tr: 'Türkçe',
        language_en: 'English',
        auto_save: 'Auto Save',
        graphics_quality: 'Graphics Quality',
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },

      // ── Breeds ──
      breeds: {
        turk_taklacisi: 'Turkish Tumbler',
        sivas_taklacisi: 'Sivas Tumbler',
        kayseri_taklacisi: 'Kayseri Tumbler',
        kelebek: 'Butterfly',
        sanliurfa_taklacisi: 'Şanlıurfa Tumbler',
        mardin_guvercini: 'Mardin Pigeon',
        filo_guvercini: 'Filo Pigeon',
        posta_guvercini: 'Carrier Pigeon',
        ankut_guvercini: 'Ankut Pigeon',
        misiri: 'Egyptian'
      },

      // ── Breed Descriptions ──
      breed_desc: {
        turk_taklacisi: 'A traditional Turkish pigeon known for graceful aerial tumbles.',
        sivas_taklacisi: 'A high-endurance tumbler native to the Sivas region.',
        kayseri_taklacisi: 'The prized tumbler breed of the Kayseri region.',
        kelebek: 'An elegant breed known for butterfly-like wing movements.',
        sanliurfa_taklacisi: 'A heat-resistant tumbler from southeastern Turkey.',
        mardin_guvercini: 'A noble breed raised in the historic streets of Mardin.',
        filo_guvercini: 'Exhibits excellent coordination in flock flight.',
        posta_guvercini: 'Famous for long-distance navigation ability.',
        ankut_guvercini: 'A hardy breed adapted to Anatolia\'s harsh climate.',
        misiri: 'An exotic-looking pigeon of Egyptian origin.'
      },

      // ── Breed Families ──
      breed_families: {
        taklaci: 'Tumbler',
        seyyah: 'Traveler',
        gosteri: 'Show',
        posta: 'Carrier',
        suruculu: 'Flock',
        label: 'Family',
        description: 'Breed Family'
      },

      // ── Stats ──
      stats: {
        tumble: 'Tumble',
        spin_speed: 'Spin Speed',
        style: 'Style',
        balance: 'Balance',
        endurance: 'Endurance',
        flock_sync: 'Flock Sync',
        health: 'Health',
        happiness: 'Happiness',
        hunger: 'Hunger',
        energy: 'Energy',
        experience: 'Experience',
        level: 'Level',
        age: 'Age',
        weight: 'Weight',
        speed: 'Speed',
        agility: 'Agility',
        charisma: 'Charisma',
        intelligence: 'Intelligence',
        total_power: 'Total Power',
        base: 'Base',
        bonus: 'Bonus',
        modifier: 'Modifier'
      },

      // ── Tiers ──
      tiers: {
        B: 'B',
        A: 'A',
        S: 'S',
        SS: 'SS',
        SSR: 'SSR',
        label: 'Quality',
        desc_B: 'Common quality',
        desc_A: 'Good quality',
        desc_S: 'Rare quality',
        desc_SS: 'Legendary quality',
        desc_SSR: 'Beyond legendary quality'
      },

      // ── Diseases ──
      diseases: {
        avian_pox: 'Avian Pox',
        newcastle: 'Newcastle Disease',
        salmonella: 'Salmonella',
        canker: 'Canker',
        respiratory: 'Respiratory Infection',
        parasites: 'Parasites',
        label: 'Disease',
        infected: 'Infected',
        healthy: 'Healthy',
        recovering: 'Recovering',
        critical: 'Critical',
        treatment: 'Treatment',
        quarantine: 'Quarantine',
        symptoms: 'Symptoms',
        cure: 'Cure',
        prevention: 'Prevention'
      },

      // ── Threats ──
      threats: {
        hawk: 'Hawk',
        cat: 'Cat',
        storm: 'Storm',
        heatwave: 'Heatwave',
        disease_outbreak: 'Disease Outbreak',
        theft: 'Theft',
        label: 'Threat',
        warning: 'Warning! Threat detected!',
        safe: 'Safe',
        danger: 'Danger',
        protect: 'Protect',
        evade: 'Evade'
      },

      // ── Tricks ──
      tricks: {
        single_tumble: 'Single Tumble',
        double_tumble: 'Double Tumble',
        chain_tumble: 'Chain Tumble',
        barrel_roll: 'Barrel Roll',
        wing_clap: 'Wing Clap',
        diving_spiral: 'Diving Spiral',
        sky_dance: 'Sky Dance',
        thunder_drop: 'Thunder Drop',
        label: 'Trick',
        locked: 'Locked',
        unlocked: 'Unlocked',
        mastered: 'Mastered',
        practice: 'Practice',
        perform: 'Perform',
        difficulty: 'Difficulty'
      },

      // ── Currencies ──
      currency: {
        coins: 'Coins',
        gems: 'Gems',
        feathers: 'Feathers',
        reputation: 'Reputation',
        tickets: 'Tickets',
        feed_token: 'Feed Token',
        premium: 'Premium',
        free: 'Free'
      },

      // ── Lifecycle Stages ──
      lifecycle: {
        egg: 'Egg',
        chick: 'Chick',
        juvenile: 'Juvenile',
        adult: 'Adult',
        elder: 'Elder',
        egg_desc: 'In incubation stage',
        chick_desc: 'Newly hatched pigeon chick',
        juvenile_desc: 'Young and ready to learn',
        adult_desc: 'Fully matured',
        elder_desc: 'Experienced and wise',
        hatching: 'Hatching',
        growing: 'Growing',
        maturity: 'Maturity',
        days_remaining: 'Days Remaining',
        incubation: 'Incubation',
        incubation_time: 'Incubation Time'
      },

      // ── Actions ──
      actions: {
        feed: 'Feed',
        breed: 'Breed',
        train: 'Train',
        heal: 'Heal',
        sell: 'Sell',
        buy: 'Buy',
        collect: 'Collect',
        upgrade: 'Upgrade',
        equip: 'Equip',
        unequip: 'Unequip',
        discard: 'Discard',
        gift: 'Gift',
        release: 'Release',
        inspect: 'Inspect',
        rename: 'Rename',
        select: 'Select',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        open: 'Open',
        claim: 'Claim',
        skip: 'Skip',
        retry: 'Retry',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
        resume: 'Resume'
      },

      // ── Quest Types ──
      quests: {
        daily: 'Daily Quest',
        weekly: 'Weekly Quest',
        story: 'Story Quest',
        challenge: 'Challenge',
        tutorial: 'Tutorial Quest',
        special: 'Special Quest',
        completed: 'Completed',
        in_progress: 'In Progress',
        not_started: 'Not Started',
        reward: 'Reward',
        objective: 'Objective',
        progress: 'Progress',
        expired: 'Expired',
        new_quest: 'New Quest!',
        quest_complete: 'Quest Complete!',
        claim_reward: 'Claim Reward'
      },

      // ── Competition Types ──
      competitions: {
        tumble_contest: 'Tumble Contest',
        speed_race: 'Speed Race',
        style_show: 'Style Show',
        endurance_flight: 'Endurance Flight',
        flock_display: 'Flock Display',
        championship: 'Championship',
        tournament: 'Tournament',
        league: 'League',
        rank: 'Rank',
        score: 'Score',
        winner: 'Winner',
        loser: 'Loser',
        draw: 'Draw',
        round: 'Round',
        finals: 'Finals',
        enter: 'Enter',
        entry_fee: 'Entry Fee',
        prize: 'Prize',
        matchmaking: 'Matchmaking...',
        opponent: 'Opponent',
        victory: 'Victory!',
        defeat: 'Defeat'
      },

      // ── Breeding Terms ──
      breeding: {
        pair: 'Pair',
        male: 'Male',
        female: 'Female',
        offspring: 'Offspring',
        genetics: 'Genetics',
        bloodline: 'Bloodline',
        generation: 'Generation',
        pedigree: 'Pedigree',
        compatibility: 'Compatibility',
        fertility: 'Fertility',
        mutation: 'Mutation',
        trait: 'Trait',
        dominant: 'Dominant',
        recessive: 'Recessive',
        inherited: 'Inherited',
        hybrid: 'Hybrid',
        purebred: 'Purebred',
        lineage: 'Lineage',
        select_male: 'Select Male',
        select_female: 'Select Female',
        breed_pair: 'Breed Pair',
        breeding_time: 'Breeding Time',
        success_rate: 'Success Rate',
        gene_pool: 'Gene Pool',
        inbreeding: 'Inbreeding',
        crossbreed: 'Crossbreed',
        hatch_chance: 'Hatch Chance'
      },

      // ── Genetic Terms ──
      genetics: {
        allele: 'Allele',
        genotype: 'Genotype',
        phenotype: 'Phenotype',
        chromosome: 'Chromosome',
        gene: 'Gene',
        dna: 'DNA',
        inheritance: 'Inheritance',
        variation: 'Variation',
        selection: 'Selection',
        mutation_chance: 'Mutation Chance',
        rare_gene: 'Rare Gene',
        gene_strength: 'Gene Strength'
      },

      // ── Onboarding ──
      onboarding: {
        welcome: 'Welcome to World of Pigeons!',
        step_1: 'This is your coop. Your pigeons live here.',
        step_2: 'Feed your first pigeon.',
        step_3: 'Train your pigeons to learn tumbles.',
        step_4: 'Go to the flight area to fly your pigeons.',
        step_5: 'Buy and sell pigeons at the market.',
        step_6: 'Enter competitions to win prizes!',
        step_7: 'Breed pigeons to produce new ones.',
        skip_tutorial: 'Skip Tutorial',
        next: 'Next',
        previous: 'Back',
        got_it: 'Got it!',
        tip: 'Tip',
        first_pigeon: 'Your first pigeon: a Turkish Tumbler!',
        name_your_pigeon: 'Name your pigeon',
        congratulations: 'Congratulations! You are now a pigeon master!'
      },

      // ── Toast Messages ──
      toast: {
        save_success: 'Game saved!',
        save_error: 'Save error!',
        load_success: 'Game loaded!',
        load_error: 'Load error!',
        purchase_success: 'Purchase successful!',
        purchase_fail: 'Insufficient balance!',
        sell_success: 'Sale successful!',
        feed_success: 'Pigeon fed!',
        feed_no_food: 'No feed available!',
        train_success: 'Training completed!',
        train_tired: 'Pigeon is too tired!',
        heal_success: 'Pigeon healed!',
        heal_not_sick: 'Pigeon is already healthy.',
        breed_success: 'New egg!',
        breed_fail: 'Breeding failed.',
        breed_incompatible: 'These pigeons are incompatible.',
        level_up: 'Level up!',
        new_trick: 'New trick learned!',
        competition_win: 'You won the competition!',
        competition_lose: 'You lost the competition.',
        quest_complete: 'Quest completed!',
        egg_hatched: 'Egg hatched!',
        pigeon_grew: 'Pigeon grew up!',
        threat_warning: 'Warning! Threat detected!',
        disease_warning: 'Pigeon got sick!',
        offline_earnings: 'Offline earnings:',
        coop_full: 'Coop is full!',
        connection_error: 'Connection error!',
        generic_error: 'An error occurred.',
        copied: 'Copied!',
        renamed: 'Renamed!',
        released: 'Pigeon released.',
        insufficient_energy: 'Insufficient energy!',
        max_level: 'Maximum level!',
        reward_claimed: 'Reward claimed!'
      },

      // ── Market Labels ──
      market: {
        title: 'Market',
        buy_tab: 'Buy',
        sell_tab: 'Sell',
        auction: 'Auction',
        price: 'Price',
        quantity: 'Quantity',
        total: 'Total',
        discount: 'Discount',
        sold_out: 'Sold Out',
        new_stock: 'New Stock',
        featured: 'Featured',
        rare: 'Rare',
        limited: 'Limited',
        best_seller: 'Best Seller',
        search: 'Search...',
        filter: 'Filter',
        sort_price: 'Sort by Price',
        sort_rarity: 'Sort by Rarity',
        sort_name: 'Sort by Name',
        category_pigeons: 'Pigeons',
        category_feed: 'Feed',
        category_medicine: 'Medicine',
        category_equipment: 'Equipment',
        category_decorations: 'Decorations',
        confirm_purchase: 'Do you want to purchase?',
        confirm_sell: 'Do you want to sell?',
        no_items: 'No items found.',
        your_balance: 'Your Balance'
      },

      // ── Flight / Coop ──
      flight: {
        title: 'Flight Area',
        launch: 'Launch',
        land: 'Land',
        altitude: 'Altitude',
        wind: 'Wind',
        weather: 'Weather',
        sunny: 'Sunny',
        cloudy: 'Cloudy',
        rainy: 'Rainy',
        windy: 'Windy',
        duration: 'Duration',
        performance: 'Performance',
        flight_log: 'Flight Log'
      },

      coop: {
        title: 'Coop',
        capacity: 'Capacity',
        empty_slot: 'Empty Slot',
        upgrade_coop: 'Upgrade Coop',
        cleanliness: 'Cleanliness',
        temperature: 'Temperature',
        clean: 'Clean',
        feed_all: 'Feed All'
      },

      // ── Time / General ──
      time: {
        day: 'Day',
        night: 'Night',
        dawn: 'Dawn',
        dusk: 'Dusk',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        speed: 'Speed',
        paused: 'Paused'
      },

      general: {
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        name: 'Name',
        description: 'Description',
        details: 'Details',
        info: 'Info',
        warning: 'Warning',
        error: 'Error',
        success: 'Success',
        loading: 'Loading...',
        empty: 'Empty',
        locked: 'Locked',
        unlocked: 'Unlocked',
        max: 'Max',
        min: 'Min',
        total: 'Total',
        average: 'Average',
        percent: '%',
        none: 'None',
        all: 'All',
        or: 'or',
        and: 'and'
      }
    }
  };

  /* ── Current language state ── */
  var currentLang = DEFAULT_LANG;

  /**
   * Resolve a dot-notation key against a nested translation object.
   * e.g. resolve('nav.coop', translations.tr) → 'Kümes'
   */
  function resolve(key, obj) {
    var parts = key.split('.');
    var node = obj;
    for (var i = 0; i < parts.length; i++) {
      if (node === undefined || node === null) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  /**
   * Translate a key to the current language.
   * Falls back to English, then to the raw key.
   */
  function t(key) {
    var val = resolve(key, translations[currentLang]);
    if (val !== undefined && typeof val === 'string') return val;
    // Fallback to English
    if (currentLang !== 'en') {
      val = resolve(key, translations.en);
      if (val !== undefined && typeof val === 'string') return val;
    }
    // Fallback to raw key
    return key;
  }

  /**
   * Set the active language and persist choice.
   */
  function setLanguage(lang) {
    if (!translations[lang]) {
      console.warn('[I18n] Unknown language:', lang);
      return;
    }
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('[I18n] Could not persist language preference.');
    }
    updateDOM();
    // Emit event if EventBus is available
    if (window.EventBus && window.EventBus.emit) {
      window.EventBus.emit(
        (window.EventBus.Events && window.EventBus.Events.LANGUAGE_CHANGED) || 'language:changed',
        lang
      );
    }
  }

  /**
   * Get the current active language code.
   */
  function getLanguage() {
    return currentLang;
  }

  /**
   * Walk the DOM and update every element that carries a data-i18n attribute.
   * Supported attributes:
   *   data-i18n="key"            → sets textContent
   *   data-i18n-placeholder="key" → sets placeholder
   *   data-i18n-title="key"      → sets title
   *   data-i18n-aria="key"       → sets aria-label
   */
  function updateDOM() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    }

    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var ph = placeholders[j];
      var pKey = ph.getAttribute('data-i18n-placeholder');
      if (pKey) ph.setAttribute('placeholder', t(pKey));
    }

    var titles = document.querySelectorAll('[data-i18n-title]');
    for (var k = 0; k < titles.length; k++) {
      var ti = titles[k];
      var tKey = ti.getAttribute('data-i18n-title');
      if (tKey) ti.setAttribute('title', t(tKey));
    }

    var arias = document.querySelectorAll('[data-i18n-aria]');
    for (var l = 0; l < arias.length; l++) {
      var ar = arias[l];
      var aKey = ar.getAttribute('data-i18n-aria');
      if (aKey) ar.setAttribute('aria-label', t(aKey));
    }
  }

  /* ── Initialization ── */
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) {
      currentLang = saved;
    }
  } catch (e) {
    // localStorage unavailable, keep default
  }

  /* ── Public API ── */
  window.I18n = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    updateDOM: updateDOM,
    /** Expose available languages for settings UI */
    availableLanguages: ['tr', 'en'],
    /** Direct access to translations (read-only use recommended) */
    _translations: translations
  };
})();
