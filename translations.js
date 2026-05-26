// cSpell:disable
/**
 * Translations Dictionary for Eureka Forbes Specialist Website
 *
 * This file contains all translatable strings for English (en), Hindi (hi), and Marathi (mr).
 * Product SKU names (e.g., "AQUAGUARD SELECT DESIGNO UTC RO+UV 2X") are intentionally
 * kept in English only to maintain factory compliance and catalog clarity.
 */

const translations = {
  en: {
    // ============================================
    // NAVIGATION
    // ============================================
    nav_home: 'Home',
    nav_products: 'Products',
    nav_contact: 'Contact',

    // ============================================
    // VALUE BANNER SECTION
    // ============================================
    vb_eyebrow: "Smart Buyer's Guide",
    vb_title: 'Why Choose a Direct Specialist Over Online Stores?',
    vb_desc:
      'Purchasing Eureka Forbes products—such as water purifiers and vacuum cleaners—through an authorized direct sales specialist offers several distinct advantages over buying from e-commerce platforms, retail stores, or unauthorized dealers. The direct sales model is designed to provide a highly customized and secure customer experience.',
    vb_card1_title: 'Personalized Home Assessments',
    vb_card1_desc:
      'Water quality varies drastically from one neighborhood to another. A direct sales specialist will visit your home to conduct a live water test before recommending a purifier, ensuring the perfect technology match.',
    vb_card2_title: 'Live, In-Home Demonstrations',
    vb_card2_desc:
      'Seeing the product perform in your actual home environment is invaluable. We demonstrate suction power on your specific carpets and floors, ensuring it handles your exact cleaning challenges.',
    vb_card3_title: 'Exclusive Campaigns & Offers',
    vb_card3_desc:
      'Authorized specialists are equipped with exclusive promotional authority not available online. This includes lucrative buy-back offers on older models and custom discounts for better overall value.',
    vb_card4_title: 'Guaranteed Authenticity',
    vb_card4_desc:
      'Buying directly guarantees that the product is 100% genuine and factory-fresh. It completely eliminates the risk of refurbished units and ensures your warranty is correctly registered.',
    vb_card5_title: 'Dedicated After-Sales Support',
    vb_card5_desc:
      'Instead of navigating generic hotlines, you gain a trusted relationship with a dedicated specialist for prompt installation, AMC setups, and efficient troubleshooting.',

    // ============================================
    // PRODUCTS SECTION
    // ============================================
    products_eyebrow: 'Featured Products',
    products_title: 'Selected SKUs and offline-only offers',
    products_desc:
      'Choose from top-quality products that are available through direct sales and exclusive offline channels.',
    intro_badge1: 'Authorized Direct Sales',
    intro_badge2: 'Free Home Demo',
    intro_badge3: 'Exclusive Offers',
    filter_all: 'All Products',
    filter_water: 'Water Purifiers',
    filter_air: 'Air Purifiers',
    filter_vacuum: 'Vacuum Cleaners',
    filter_softener: 'Water Softeners',
    btn_ask: 'Ask for This SKU',
    btn_check_suitability: 'Check Suitability',
    btn_check_hard_water: 'Check Hard Water Solution',
    btn_get_best_offer: 'Get Best Offer',
    btn_get_recommendation: 'Get Recommendation',
    btn_get_details: 'Get Details',
    btn_exchange: 'Exchange Offer',

    offer_eyebrow: 'Limited Time Offer',
    offer_title: 'Mega May Deals!',
    offer_desc:
      'Take advantage of these official Eureka Forbes Mega May Deals today. Offer valid until the end of May.',
    offer_btn: 'Claim This Offer on WhatsApp',

    cat_water: 'Water Purifiers',
    cat_water_desc: 'RO, UV, UF & Copper',
    cat_vacuum: 'Vacuum Cleaners',
    cat_vacuum_desc: 'Robotic, Cordless & Dry/Wet',
    cat_air: 'Air Purifiers',
    cat_air_desc: 'HEPA & Smart Sensors',
    cat_softener: 'Water Softeners',
    cat_softener_desc: 'Whole House Solutions',
    btn_back_categories: 'Back to Categories',

    // Product Tags
    tag_water: 'Water Purifier',
    tag_air: 'Air Purifier',
    tag_vacuum: 'Vacuum Cleaner',
    tag_water_softener: 'Water Softener',

    // ============================================
    // CONTACT SECTION
    // ============================================
    contact_eyebrow: 'Contact Your Specialist',
    contact_title: 'Ready to place an order?',
    contact_desc: 'Send a message, call, or WhatsApp directly to book products or schedule a free home demonstration.',
    contact_name: 'Name:',
    contact_service_area: 'Service Area:',
    contact_phone: 'Phone:',
    contact_email: 'Email:',
    contact_whatsapp: 'WhatsApp:',
    contact_email_btn: 'Email Support',
    contact_wa_btn: 'WhatsApp Care',
    contact_official_title: 'Eureka Forbes Customer Care',
    contact_official_phone: 'Toll-Free / Phone:',
    contact_official_whatsapp: 'Official WhatsApp:',
    contact_official_email: 'Support Email:',

    // ============================================
    // FOOTER
    // ============================================
    footer_text1: '© 2026 Eureka Forbes Direct Sales Specialist',
    footer_text2: 'Selected SKUs and offline-only offers for your customers.',
    footer_legal_link: 'Legal & Copyright Info',
    footer_disclaimer_text:
      'Disclaimer: This website is independently operated by Paras Singh Chawsali, an Authorized Direct Sales Representative for Eureka Forbes. This is NOT the official website of Eureka Forbes Limited. All product names, logos, brands, trademarks, and images featured or referred to within this site are the sole property of Eureka Forbes Limited and are used strictly for informational and demonstrative purposes to facilitate direct sales. This platform is intended solely for product display and inquiry generation. No payments or financial transactions are processed through this website. All final purchases, billing, and installations are handled strictly through official Eureka Forbes channels.',

    // ============================================
    // HEADER
    // ============================================
    header_rep_title: 'Customer Sales Specialist',
    header_rep_badge: 'Independent Authorized Direct Sales Representative',

    // ============================================
    // FAQ SECTION
    // ============================================
    faq_eyebrow: 'Common Questions',
    faq_title: 'Frequently Asked Questions',
    faq_desc: 'Get instant answers to the most common questions about water purification, technology, and maintenance.',
    faq_tab_aquaguards: 'Aquaguards',
    faq_tab_vacuums: 'Vacuum Cleaners',
    faq_tab_service: 'Servicing & AMC',
    faq_q1: 'If the municipal corporation already treats our water, why do I need an Aquaguard?',
    faq_a1:
      "While water is treated at the main municipal plant, it travels through kilometers of aging, rusted underground pipelines before reaching your building. Micro-cracks frequently cause underground sewage seepage and cross-contamination right before it hits your tap. Additionally, unless your building's overhead and underground storage tanks are professionally sanitized every month, they accumulate silt, biological slime, and bacteria that re-contaminate the water.",
    faq_q2: "We boil our water at home anyway. Doesn't that make a purifier unnecessary?",
    faq_a2:
      'Boiling is excellent for neutralizing living bacteria and viruses, but it completely fails against chemical pollutants. Boiling cannot remove dissolved heavy metals (like lead, arsenic, or mercury), rust flakes, muddy turbidity, or agricultural pesticides. In fact, as water evaporates during boiling, the density of these dangerous dissolved toxins actually increases. Furthermore, boiling cannot remove the heavy chlorine smell or taste often added by municipal treatment plants.',
    faq_q3: 'What exactly is 5th Gen UV LED technology and how long does it last?',
    faq_a3:
      '5th Generation UV LED is the absolute pinnacle of modern water sterilization, replacing older glass UV tubes. Unlike legacy bulbs that require a warm-up period, 5th Gen LEDs activate instantly the millisecond water flows, ensuring 100% safe water from the very first drop. They are completely mercury-free, generate zero heat (so your water stays cool), and possess an incredible durable lifespan of up to 10 years, dramatically lowering your long-term maintenance layouts.',
    faq_q4: 'Is an Annual Maintenance Contract (AMC) a worthwhile investment?',
    faq_a4:
      "Absolutely. Think of your purifier as a protective shield; it works by physically trapping mud, chemical particles, and heavy metals so they don't enter your body. Over 6 to 12 months, these heavy-duty carbon blocks and membranes inevitably get completely choked with the dirt they blocked. An active AMC ensures a certified technician comes straight to your doorstep to deep-clean the system and swap cartridges with genuine factory spares before they fail, guaranteeing 365 days of instant health safety.",
    faq_q5: 'Do I really need an RO purifier if I live in Mumbai, Navi Mumbai, or Thane?',
    faq_a5:
      "It depends on your building's water source. If your society relies strictly on municipal water (NMMC, TMC, or BMC), the water is naturally soft and a UV+UF purifier is usually sufficient to remove pathogens and rust. However, if your society uses borewell water or orders private water tankers (common during summer cuts), an RO purifier is highly recommended to handle the fluctuating TDS (Total Dissolved Solids) and hardness.",
    faq_q6: 'Will an RO purifier remove essential minerals from my drinking water?',
    faq_a6:
      'No. Modern Aquaguard RO models come equipped with patented Mineral Guard™ technology. This ensures that while heavy metals, excess salts, and harmful impurities are filtered out, essential natural minerals like calcium and magnesium are retained in your drinking water.',
    faq_q7: 'How often do I need to replace the filters in my Aquaguard?',
    faq_a7:
      "Typically, the pre-filter and carbon filters need replacement every 6 to 12 months, depending on your household's water consumption and the input water quality. If you live in an area with older GI plumbing, sediment filters may need replacing sooner. Your machine will also alert you when it's time for a filter change.",
    faq_q8: 'Can I exchange my old water purifier for a new Aquaguard?',
    faq_a8:
      'Yes! We are currently running an official Aquaguard Buy-Back and Exchange campaign (valid until December 2026). You can exchange your old water purifier—regardless of the brand or condition—for a significant discount on a new, upgraded Aquaguard model. Contact me via WhatsApp to get an exact valuation for your old machine.',
    faq_q9: 'Which vacuum cleaner is better for Indian homes: Bagless or Bagged?',
    faq_a9:
      'Both are highly effective, but they serve different needs. Bagless (cyclonic) models are incredibly convenient, lightweight, and save you the cost of buying replacement bags. Bagged models, however, are often recommended for allergy sufferers as the dust is completely sealed away during disposal, preventing dust clouds.',
    faq_q10: 'Can a vacuum cleaner help if I or my family members have dust allergies?',
    faq_a10:
      "Absolutely. If you have dust allergies, look for our Forbes models equipped with a True HEPA (High-Efficiency Particulate Air) filter. These filters trap 99.9% of microscopic allergens, dust mites, and pet hair, ensuring they are not exhausted back into your room's air.",
    faq_q11: 'Does a handheld vacuum cleaner replace a standard floor vacuum?',
    faq_a11:
      'Handheld vacuums are excellent for quick cleanups, car interiors, sofas, and hard-to-reach corners. However, for deep cleaning large carpets and entire floors, a canister or robotic vacuum cleaner provides the sustained suction power and battery life required.',
    faq_q12: 'Why does my vacuum cleaner get hot and shut off?',
    faq_a12:
      'This is a built-in safety feature. If the dust bag is completely full, or if the filters or hoses are severely clogged with hair or debris, the motor works harder and heats up. Emptying the dust cup and cleaning the filter regularly will prevent this and ensure maximum suction power.',
    faq_q13: 'How do I book a free home demonstration?',
    faq_a13:
      'Simply click the "Book a Demo" button or message me directly on WhatsApp. Since I am your authorized local Eureka Forbes specialist for Navi Mumbai and Thane, I will bring the selected models to your home so you can see exactly how they perform in your own space before making a decision.',
    faq_q14: 'What is covered under the Eureka Forbes AMC (Annual Maintenance Contract)?',
    faq_a14:
      'A genuine Aquaguard AMC gives you complete peace of mind. It generally includes up to 3 scheduled maintenance visits a year, annual filter replacement, tank cleaning, unlimited breakdown repair visits, and free replacement of spare parts (including electronics and pumps) depending on the plan you choose.',
    faq_q15: 'How soon will my product be installed after purchase?',
    faq_a15:
      'Installation is incredibly fast. Once your order is confirmed, an authorized Eureka Forbes technician will arrive at your home to install the device within 24 to 48 hours.',

    // ============================================
    // DEMO FORM
    // ============================================
    // ============================================
    // LEGAL TERMS PAGE
    // ============================================
    legal_title: 'Legal & Copyright Information',
    legal_subtitle: 'Important legal disclaimers regarding the operation of this independent sales portfolio.',
    legal_s1_title: 'Intellectual Property & Copyright Acknowledgment',
    legal_s1_text:
      'The content provided on this website is for educational and sales inquiry purposes only. I, as an authorized direct salesperson, utilize official product images and specifications to accurately represent the water purifiers, vacuum cleaners, and other products to prospective clients. No copyright infringement is intended. The intellectual property rights of all product images, proprietary technology names, and brand assets remain entirely with Eureka Forbes Limited.',
    legal_s2_title: 'No E-commerce Transactions',
    legal_s2_text:
      'To ensure customer security and adhere to authorized sales protocols, this website does not feature any payment gateways. Visitors cannot buy products directly on this site. If you wish to purchase a product after reviewing the information here, I will personally assist you with the official documentation and payment process as dictated by Eureka Forbes Limited.',
    legal_s3_title: 'Privacy & Data Collection',
    legal_s3_text:
      'Any personal information submitted through forms on this website (such as name, phone number, and address) is used strictly for the purpose of scheduling demonstrations, water tests, or providing product information. Your data is never sold or shared with unauthorized third parties.',
    legal_s4_title: 'Limitation of Liability',
    legal_s4_text:
      'While every effort is made to ensure product specifications, features, and prices are accurate, these details are subject to change by Eureka Forbes Limited without prior notice. The operator of this website shall not be held liable for any discrepancies.',

    demo_form_name_placeholder: 'Your Name',
    demo_form_phone_placeholder: 'Phone Number',
    demo_form_email_placeholder: 'Email ID',
    demo_form_address_placeholder: 'Full Address',

    demo_form_title: 'Book a Free Demo',
    demo_form_btn: 'Submit & Send via WhatsApp',
    search_placeholder: 'Search products...',
    share_btn: 'Share on WhatsApp',
    share_fb_btn: 'Share on Facebook',
    share_copy_btn: 'Copy Link',
    error_title: 'Page Not Found',
    error_desc:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    error_btn: 'Return to Homepage',
  },

  hi: {
    // ============================================
    // NAVIGATION
    // ============================================
    nav_home: 'होम',
    nav_products: 'उत्पाद',
    nav_contact: 'संपर्क',

    // ============================================
    // VALUE BANNER SECTION
    // ============================================
    vb_eyebrow: 'स्मार्ट बायर गाइड',
    vb_title: 'ऑनलाइन स्टोर के बजाय डायरेक्ट स्पेशलिस्ट को क्यों चुनें?',
    vb_desc:
      'ई-कॉमर्स या रिटेल स्टोर से खरीदने की तुलना में अधिकृत डायरेक्ट सेल्स स्पेशलिस्ट के माध्यम से यूरेका फोर्ब्स उत्पाद खरीदना कई फायदे देता है। यह मॉडल अत्यधिक अनुकूलित और सुरक्षित ग्राहक अनुभव प्रदान करने के लिए डिज़ाइन किया गया है।',
    vb_card1_title: 'व्यक्तिगत होम असेसमेंट',
    vb_card1_desc:
      'पानी की गुणवत्ता हर जगह अलग होती है। एक विशेषज्ञ सही तकनीक सुनिश्चित करने के लिए प्यूरीफायर की सिफारिश करने से पहले आपके घर पर लाइव वाटर टेस्ट करेगा।',
    vb_card2_title: 'लाइव, इन-होम डेमो',
    vb_card2_desc:
      'अपने वास्तविक घर के वातावरण में उत्पाद का प्रदर्शन देखना अमूल्य है। हम आपके घर की सफाई की चुनौतियों को सुनिश्चित करने के लिए डेमो देते हैं।',
    vb_card3_title: 'एक्सक्लूसिव ऑफर और बाय-बैक',
    vb_card3_desc:
      'अधिकृत विशेषज्ञों के पास विशेष प्रचार अधिकार होते हैं जो ऑनलाइन उपलब्ध नहीं हैं। इसमें पुराने मॉडलों पर आकर्षक बाय-बैक ऑफर और कस्टम छूट शामिल हैं।',
    vb_card4_title: 'प्रामाणिकता की गारंटी',
    vb_card4_desc:
      'सीधे खरीदने से गारंटी मिलती है कि उत्पाद 100% असली और फैक्ट्री-फ्रेश है। यह वारंटी को सही ढंग से पंजीकृत करना सुनिश्चित करता है।',
    vb_card5_title: 'समर्पित आफ्टर-सेल्स सपोर्ट',
    vb_card5_desc:
      'सामान्य हेल्पलाइन के बजाय, आपको त्वरित स्थापना, एएमसी सेटअप और कुशल समस्या निवारण के लिए एक समर्पित विशेषज्ञ मिलता है।',

    // ============================================
    // PRODUCTS SECTION
    // ============================================
    products_eyebrow: 'विशेष उत्पाद',
    products_title: 'चयनित SKU और ऑफ़लाइन-केवल ऑफर',
    products_desc:
      'शीर्ष-गुणवत्ता के उत्पादों में से चुनें जो सीधी बिक्री और एक्सक्लूसिव ऑफ़लाइन चैनलों के माध्यम से उपलब्ध हैं।',
    intro_badge1: 'अधिकृत प्रत्यक्ष बिक्री',
    intro_badge2: 'मुफ्त होम डेमो',
    intro_badge3: 'एक्सक्लूसिव ऑफर',
    filter_all: 'सभी उत्पाद',
    filter_water: 'जल शुद्धिकरण',
    filter_air: 'वायु शुद्धिकरण',
    filter_vacuum: 'वैक्यूम क्लीनर',
    filter_softener: 'जल सॉफ़्टनर',
    btn_ask: 'इस SKU के लिए पूछें',
    btn_check_suitability: 'उपयुक्तता जांचें',
    btn_check_hard_water: 'कठोर जल समाधान जांचें',
    btn_get_best_offer: 'सर्वोत्तम ऑफर प्राप्त करें',
    btn_get_recommendation: 'सिफारिश प्राप्त करें',
    btn_get_details: 'विवरण प्राप्त करें',
    btn_exchange: 'एक्सचेंज ऑफर',

    offer_eyebrow: 'सीमित समय का ऑफर',
    offer_title: 'मेगा मई डील्स!',
    offer_desc: 'आज ही इन आधिकारिक यूरेका फोर्ब्स मेगा मई डील्स का लाभ उठाएं। ऑफर मई के अंत तक वैध है।',
    offer_btn: 'व्हाट्सएप पर इस ऑफर का दावा करें',

    cat_water: 'वॉटर प्यूरीफायर',
    cat_water_desc: 'RO, UV, UF और कॉपर',
    cat_vacuum: 'वैक्यूम क्लीनर',
    cat_vacuum_desc: 'रोबोटिक, कॉर्डलेस और ड्राई/वेट',
    cat_air: 'एयर प्यूरीफायर',
    cat_air_desc: 'HEPA और स्मार्ट सेंसर',
    cat_softener: 'वॉटर सॉफ्टनर',
    cat_softener_desc: 'पूरे घर के लिए समाधान',
    btn_back_categories: 'श्रेणियों पर वापस जाएं',

    // Product Tags
    tag_water: 'जल शुद्धिकरण',
    tag_air: 'वायु शुद्धिकरण',
    tag_vacuum: 'वैक्यूम क्लीनर',
    tag_water_softener: 'जल सॉफ़्टनर',

    // ============================================
    // CONTACT SECTION
    // ============================================
    contact_eyebrow: 'अपने विशेषज्ञ से संपर्क करें',
    contact_title: 'ऑर्डर देने के लिए तैयार हैं?',
    contact_desc: 'चयनित उत्पाद बुक करने या घर पर मुफ्त डेमो शेड्यूल करने के लिए सीधे कॉल या व्हाट्सएप करें।',
    contact_name: 'नाम:',
    contact_service_area: 'सेवा क्षेत्र:',
    contact_phone: 'फोन:',
    contact_email: 'ईमेल:',
    contact_whatsapp: 'व्हाट्सएप:',
    contact_email_btn: 'ईमेल सपोर्ट',
    contact_wa_btn: 'व्हाट्सएप केयर',
    contact_official_title: 'यूरेका फोर्ब्स कस्टमर केयर',
    contact_official_phone: 'टोल-फ्री / फ़ोन:',
    contact_official_whatsapp: 'आधिकारिक व्हाट्सएप:',
    contact_official_email: 'सपोर्ट ईमेल:',

    // ============================================
    // FOOTER
    // ============================================
    footer_text1: '© 2026 यूरेका फोर्ब्स प्रत्यक्ष बिक्री विशेषज्ञ',
    footer_text2: 'आपके ग्राहकों के लिए चयनित SKU और ऑफ़लाइन-केवल ऑफर।',
    footer_legal_link: 'कानूनी और कॉपीराइट जानकारी',
    footer_disclaimer_text:
      'अस्वीकरण: यह वेबसाइट पारस सिंह चावसाली द्वारा स्वतंत्र रूप से संचालित की जाती है, जो यूरेका फोर्ब्स के लिए एक अधिकृत प्रत्यक्ष बिक्री प्रतिनिधि हैं। यह यूरेका फोर्ब्स लिमिटेड की आधिकारिक वेबसाइट नहीं है। इस साइट पर प्रदर्शित या संदर्भित सभी उत्पाद नाम, लोगो, ब्रांड, ट्रेडमार्क और चित्र यूरेका फोर्ब्स लिमिटेड की एकमात्र संपत्ति हैं और प्रत्यक्ष बिक्री की सुविधा के लिए केवल सूचनात्मक और प्रदर्शन उद्देश्यों के लिए उपयोग किए जाते हैं। यह प्लेटफ़ॉर्म केवल उत्पाद प्रदर्शन और पूछताछ उत्पन्न करने के लिए है। इस वेबसाइट के माध्यम से कोई भुगतान या वित्तीय लेन-देन नहीं किया जाता है। सभी अंतिम खरीद, बिलिंग और इंस्टॉलेशन पूरी तरह से आधिकारिक यूरेका फोर्ब्स चैनलों के माध्यम से निपटाए जाते हैं।',
    header_rep_title: 'ग्राहक बिक्री विशेषज्ञ',
    header_rep_badge: 'स्वतंत्र अधिकृत प्रत्यक्ष बिक्री प्रतिनिधि',

    // ============================================
    // FAQ SECTION
    // ============================================
    faq_eyebrow: 'सामान्य प्रश्न',
    faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
    faq_desc: 'जल शुद्धिकरण, प्रौद्योगिकी और रखरखाव के बारे में सबसे आम प्रश्नों के त्वरित उत्तर प्राप्त करें।',
    faq_tab_aquaguards: 'एक्वागार्ड्स',
    faq_tab_vacuums: 'वैक्यूम क्लीनर',
    faq_tab_service: 'सर्विसिंग और AMC',
    faq_q1: 'अगर नगर निगम पहले से ही हमारे पानी का उपचार करता है, तो मुझे एक्वागार्ड की क्यों जरूरत है?',
    faq_a1:
      'हालांकि पानी मुख्य नगर निगम संयंत्र में उपचारित किया जाता है, यह आपकी इमारत तक पहुंचने से पहले किलोमीटर पुरानी, जंग लगी भूमिगत पाइपलाइनों से होकर गुजरता है। माइक्रो-दरारें अक्सर भूमिगत सीवेज रिसाव और क्रॉस-दूषित होने का कारण बनती हैं। इसके अलावा, जब तक आपकी इमारत की ओवरहेड और भूमिगत भंडारण टंकियों को हर महीने पेशेवर रूप से स्वच्छ नहीं किया जाता, वे गाद, जैविक स्लाइम और बैक्टीरिया जमा करते हैं जो पानी को फिर से दूषित कर देते हैं।',
    faq_q2: 'हम वैसे भी घर पर पानी उबालते हैं। क्या इससे प्यूरीफायर बेकार नहीं हो जाता?',
    faq_a2:
      'उबालना जीवित बैक्टीरिया और वायरस को बेअसर करने के लिए उत्कृष्ट है, लेकिन यह रासायनिक प्रदूषकों के खिलाफ पूरी तरह विफल रहता है। उबालने से घुलनशील भारी धातुओं (सीसा, आर्सेनिक या मर्क्युरी जैसे), जंग के टुकड़े, कीचड़ वाली गंदगी या कृषि कीटनाशकों को नहीं हटाया जा सकता। वास्तव में, उबालने के दौरान पानी के वाष्पित होने के साथ, इन खतरनाक घुलनशील विषाक्त पदार्थों का घनत्व वास्तव में बढ़ जाता है। इसके अलावा, उबालने से भारी क्लोरिन की गंध या स्वाद को नहीं हटाया जा सकता जो अक्सर नगर निगम उपचार संयंत्रों द्वारा जोड़ा जाता है।',
    faq_q3: '5th Gen UV LED तकनीक वास्तव में क्या है और यह कितने समय तक चलती है?',
    faq_a3:
      '5th Generation UV LED आधुनिक जल विसंक्रमण का सर्वोच्च शिखर है, जो पुरानी कांच की UV ट्यूबों की जगह लेता है। विरासत बल्बों के विपरीत जिन्हें वार्म-अप अवधि की आवश्यकता होती है, 5th Gen LEDs पानी के बहते ही तुरंत सक्रिय हो जाते हैं, पहले बूंद से ही 100% सुरक्षित पानी सुनिश्चित करते हैं। ये पूरी तरह से पारा-मुक्त हैं, शून्य गर्मी उत्पन्न करते हैं (ताकि आपका पानी ठंडा रहे), और 10 साल तक की अविश्वसनीय रूप से टिकाऊ जीवनकाल रखते हैं, जो आपके दीर्घकालिक रखरखाव लागत को नाटकीय रूप से कम करता है।',
    faq_q4: 'क्या वार्षिक रखरखाव अनुबंध (AMC) लेना एक सही निवेश है?',
    faq_a4:
      'बिल्कुल। अपने प्यूरीफायर के बारे में एक सुरक्षात्मक ढाल के रूप में सोचें; यह कीचड़, रासायनिक कणों और भारी धातुओं को शारीरिक रूप से फंसाकर काम करता है ताकि वे आपके शरीर में प्रवेश न करें। 6 से 12 महीनों में, ये भारी-शुल्क कार्बन ब्लॉक और झिल्लियां अपरिहार्य रूप से उस गंदगी से पूरी तरह से भर जाती हैं जिसे उन्होंने रोका। एक सक्रिय AMC सुनिश्चित करता है कि एक प्रमाणित तकनीशियन आपके दरवाजे पर सीधे आकर सिस्टम को गहराई से साफ करे और विफल होने से पहले असली कारखाना स्पेयर्स के साथ कार्ट्रिज बदल दे, 365 दिनों की तुरंत स्वास्थ्य सुरक्षा की गारंटी देता है।',
    faq_q5: 'अगर मैं मुंबई, नवी मुंबई या ठाणे में रहता हूं तो क्या मुझे वाकई RO प्यूरीफायर की जरूरत है?',
    faq_a5:
      'यह आपकी बिल्डिंग के पानी के स्रोत पर निर्भर करता है। यदि आपकी सोसाइटी पूरी तरह से नगरपालिका के पानी (NMMC, TMC, या BMC) पर निर्भर है, तो पानी स्वाभाविक रूप से नरम होता है और रोगजनकों और जंग को हटाने के लिए एक UV+UF प्यूरीफायर आमतौर पर पर्याप्त होता है। हालांकि, यदि आपकी सोसाइटी बोरवेल के पानी का उपयोग करती है या निजी पानी के टैंकर मंगवाती है (जो गर्मियों में कटौती के दौरान आम है), तो उतार-चढ़ाव वाले TDS (कुल घुलित ठोस) और कठोरता को संभालने के लिए RO प्यूरीफायर की अत्यधिक अनुशंसा की जाती है।',
    faq_q6: 'क्या RO प्यूरीफायर मेरे पीने के पानी से आवश्यक खनिजों को हटा देगा?',
    faq_a6:
      'नहीं। आधुनिक एक्वागार्ड RO मॉडल पेटेंटेड मिनरल गार्ड™ तकनीक से लैस हैं। यह सुनिश्चित करता है कि भारी धातुओं, अतिरिक्त लवणों और हानिकारक अशुद्धियों को फ़िल्टर करते समय, आपके पीने के पानी में कैल्शियम और मैग्नीशियम जैसे आवश्यक प्राकृतिक खनिज बने रहें।',
    faq_q7: 'मुझे अपने एक्वागार्ड में फिल्टर कितनी बार बदलने की जरूरत है?',
    faq_a7:
      'आमतौर पर, प्री-फिल्टर और कार्बन फिल्टर को हर 6 से 12 महीने में बदलने की जरूरत होती है, यह आपके घर के पानी की खपत और इनपुट पानी की गुणवत्ता पर निर्भर करता है। यदि आप पुराने GI प्लंबिंग वाले क्षेत्र में रहते हैं, तो सेडिमेंट फिल्टर को जल्दी बदलने की आवश्यकता हो सकती है। आपकी मशीन फिल्टर बदलने का समय आने पर आपको सचेत भी करेगी।',
    faq_q8: 'क्या मैं अपने पुराने वॉटर प्यूरीफायर को नए एक्वागार्ड से बदल सकता हूं?',
    faq_a8:
      'हाँ! हम वर्तमान में एक आधिकारिक एक्वागार्ड बाय-बैक और एक्सचेंज अभियान चला रहे हैं (दिसंबर 2026 तक वैध)। आप अपने पुराने वॉटर प्यूरीफायर को - ब्रांड या स्थिति की परवाह किए बिना - एक नए, उन्नत एक्वागार्ड मॉडल पर महत्वपूर्ण छूट के लिए एक्सचेंज कर सकते हैं। अपनी पुरानी मशीन का सटीक मूल्यांकन प्राप्त करने के लिए व्हाट्सएप के माध्यम से मुझसे संपर्क करें।',
    faq_q9: 'भारतीय घरों के लिए कौन सा वैक्यूम क्लीनर बेहतर है: बैगलेस या बैग्ड?',
    faq_a9:
      'दोनों ही अत्यधिक प्रभावी हैं, लेकिन वे अलग-अलग जरूरतों को पूरा करते हैं। बैगलेस (साइक्लोनिक) मॉडल अविश्वसनीय रूप से सुविधाजनक, हल्के होते हैं, और आपको प्रतिस्थापन बैग खरीदने की लागत से बचाते हैं। हालांकि, बैग्ड मॉडल अक्सर एलर्जी पीड़ितों के लिए अनुशंसित होते हैं क्योंकि निपटान के दौरान धूल पूरी तरह से सील हो जाती है, जिससे धूल के बादल नहीं बनते।',
    faq_q10: 'अगर मुझे या मेरे परिवार के सदस्यों को धूल से एलर्जी है तो क्या वैक्यूम क्लीनर मदद कर सकता है?',
    faq_a10:
      'बिल्कुल। यदि आपको धूल से एलर्जी है, तो हमारे फोर्ब्स मॉडल देखें जो ट्रू HEPA (हाई-एफिशिएंसी पार्टिकुलेट एयर) फिल्टर से लैस हैं। ये फिल्टर 99.9% सूक्ष्म एलर्जी, धूल के कण और पालतू जानवरों के बालों को फंसाते हैं, यह सुनिश्चित करते हुए कि वे आपके कमरे की हवा में वापस नहीं छोड़े जाते।',
    faq_q11: 'क्या हैंडहेल्ड वैक्यूम क्लीनर एक मानक फ्लोर वैक्यूम की जगह ले सकता है?',
    faq_a11:
      'हैंडहेल्ड वैक्यूम त्वरित सफाई, कार के इंटीरियर, सोफे और दुर्गम कोनों के लिए उत्कृष्ट हैं। हालांकि, बड़े कालीनों और पूरे फर्श की गहरी सफाई के लिए, एक कनस्तर या रोबोटिक वैक्यूम क्लीनर आवश्यक निरंतर सक्शन पावर और बैटरी जीवन प्रदान करता है।',
    faq_q12: 'मेरा वैक्यूम क्लीनर गर्म होकर बंद क्यों हो जाता है?',
    faq_a12:
      'यह एक अंतर्निहित सुरक्षा सुविधा है। यदि डस्ट बैग पूरी तरह से भर गया है, या यदि फिल्टर या होसेस बालों या मलबे से गंभीर रूप से बंद हो गए हैं, तो मोटर अधिक मेहनत करती है और गर्म हो जाती है। डस्ट कप को खाली करना और फिल्टर को नियमित रूप से साफ करना इसे रोकेगा और अधिकतम सक्शन पावर सुनिश्चित करेगा।',
    faq_q13: 'मैं मुफ्त होम डेमो कैसे बुक करूं?',
    faq_a13:
      '"बुक ए डेमो" बटन पर क्लिक करें या मुझे सीधे व्हाट्सएप पर संदेश भेजें। चूंकि मैं नवी मुंबई और ठाणे के लिए आपका अधिकृत स्थानीय यूरेका फोर्ब्स विशेषज्ञ हूं, इसलिए मैं चयनित मॉडल आपके घर लाऊंगा ताकि आप निर्णय लेने से पहले देख सकें कि वे आपके अपने स्थान पर कैसा प्रदर्शन करते हैं।',
    faq_q14: 'यूरेका फोर्ब्स AMC (वार्षिक रखरखाव अनुबंध) के तहत क्या कवर किया गया है?',
    faq_a14:
      'एक वास्तविक एक्वागार्ड AMC आपको पूरी मानसिक शांति देता है। इसमें आम तौर पर साल में 3 निर्धारित रखरखाव दौरे, वार्षिक फिल्टर प्रतिस्थापन, टैंक की सफाई, असीमित ब्रेकडाउन मरम्मत दौरे, और आपके द्वारा चुने गए प्लान के आधार पर स्पेयर पार्ट्स (इलेक्ट्रॉनिक्स और पंप सहित) का मुफ्त प्रतिस्थापन शामिल होता है।',
    faq_q15: 'खरीद के बाद मेरा उत्पाद कितनी जल्दी स्थापित हो जाएगा?',
    faq_a15:
      'स्थापना अविश्वसनीय रूप से तेज है। एक बार जब आपका ऑर्डर कन्फर्म हो जाता है, तो एक अधिकृत यूरेका फोर्ब्स तकनीशियन 24 से 48 घंटों के भीतर डिवाइस को स्थापित करने के लिए आपके घर पहुंच जाएगा।',

    // ============================================
    // DEMO FORM
    // ============================================
    // ============================================
    // LEGAL TERMS PAGE
    // ============================================
    legal_title: 'कानूनी और कॉपीराइट जानकारी',
    legal_subtitle: 'इस स्वतंत्र बिक्री पोर्टफोलियो के संचालन से संबंधित महत्वपूर्ण कानूनी अस्वीकरण।',
    legal_s1_title: 'बौद्धिक संपदा और कॉपीराइट स्वीकृति',
    legal_s1_text:
      'इस वेबसाइट पर प्रदान की गई सामग्री केवल शैक्षिक और बिक्री पूछताछ उद्देश्यों के लिए है। मैं, एक अधिकृत प्रत्यक्ष विक्रेता के रूप में, संभावित ग्राहकों को वॉटर प्यूरीफायर, वैक्यूम क्लीनर और अन्य उत्पादों का सटीक प्रतिनिधित्व करने के लिए आधिकारिक उत्पाद छवियों और विशिष्टताओं का उपयोग करता हूं। कोई कॉपीराइट उल्लंघन का इरादा नहीं है। सभी उत्पाद छवियों, मालिकाना प्रौद्योगिकी नामों और ब्रांड संपत्तियों के बौद्धिक संपदा अधिकार पूरी तरह से यूरेका फोर्ब्स लिमिटेड के पास रहते हैं।',
    legal_s2_title: 'कोई ई-कॉमर्स लेन-देन नहीं',
    legal_s2_text:
      'ग्राहक सुरक्षा सुनिश्चित करने और अधिकृत बिक्री प्रोटोकॉल का पालन करने के लिए, इस वेबसाइट पर कोई भुगतान गेटवे नहीं है। आगंतुक इस साइट पर सीधे उत्पाद नहीं खरीद सकते। यदि आप यहां दी गई जानकारी की समीक्षा करने के बाद कोई उत्पाद खरीदना चाहते हैं, तो मैं यूरेका फोर्ब्स लिमिटेड द्वारा निर्धारित आधिकारिक दस्तावेज और भुगतान प्रक्रिया में व्यक्तिगत रूप से आपकी सहायता करूंगा।',
    legal_s3_title: 'गोपनीयता और डेटा संग्रह',
    legal_s3_text:
      'इस वेबसाइट पर फॉर्म के माध्यम से जमा की गई कोई भी व्यक्तिगत जानकारी (जैसे नाम, फोन नंबर और पता) का उपयोग केवल प्रदर्शन, जल परीक्षण या उत्पाद की जानकारी प्रदान करने के लिए किया जाता है। आपका डेटा कभी भी अनधिकृत तृतीय पक्षों के साथ बेचा या साझा नहीं किया जाता है।',
    legal_s4_title: 'दायित्व की सीमा',
    legal_s4_text:
      'हालांकि यह सुनिश्चित करने के लिए हर संभव प्रयास किया जाता है कि उत्पाद विनिर्देश, विशेषताएं और मूल्य सटीक हों, ये विवरण पूर्व सूचना के बिना यूरेका फोर्ब्स लिमिटेड द्वारा परिवर्तन के अधीन हैं। इस वेबसाइट के ऑपरेटर को किसी भी विसंगतियों के लिए उत्तरदायी नहीं ठहराया जाएगा।',

    demo_form_name_placeholder: 'अपना नाम दर्ज करें',
    demo_form_phone_placeholder: 'फोन नंबर दर्ज करें',
    demo_form_email_placeholder: 'ईमेल आईडी दर्ज करें',
    demo_form_address_placeholder: 'पूरा पता दर्ज करें',

    demo_form_title: 'मुफ्त डेमो बुक करें',
    demo_form_btn: 'सबमिट करें और व्हाट्सएप के माध्यम से भेजें',
    search_placeholder: 'उत्पाद खोजें...',
    share_btn: 'व्हाट्सएप पर शेयर करें',
    share_fb_btn: 'फेसबुक पर शेयर करें',
    share_copy_btn: 'लिंक कॉपी करें',
    error_title: 'पृष्ठ नहीं मिला',
    error_desc:
      'आप जिस पृष्ठ की तलाश कर रहे हैं उसे हटा दिया गया होगा, उसका नाम बदल दिया गया होगा, या अस्थायी रूप से अनुपलब्ध होगा।',
    error_btn: 'होमपेज पर लौटें',
  },

  mr: {
    // ============================================
    // NAVIGATION
    // ============================================
    nav_home: 'होम',
    nav_products: 'उत्पादने',
    nav_contact: 'संपर्क',

    // ============================================
    vb_title: 'ऑनलाइन स्टोअरऐवजी डायरेक्ट स्पेशलिस्ट का निवडावा?',
    vb_desc:
      'ई-कॉमर्स किंवा रिटेल स्टोअरमधून खरेदी करण्याऐवजी अधिकृत डायरेक्ट सेल्स स्पेशलिस्टद्वारे युरेका फोर्ब्स उत्पादने खरेदी केल्याने अनेक फायदे मिळतात. हे मॉडेल अत्यंत सानुकूलित आणि सुरक्षित ग्राहक अनुभव प्रदान करण्यासाठी डिझाइन केले आहे.',
    vb_card1_title: 'वैयक्तिक होम असेसमेंट',
    vb_card1_desc:
      'पाण्याची गुणवत्ता प्रत्येक ठिकाणी बदलते. योग्य तंत्रज्ञान सुनिश्चित करण्यासाठी प्युरिफायरची शिफारस करण्यापूर्वी एक विशेषज्ञ आपल्या घरी लाइव्ह वॉटर टेस्ट करेल.',
    vb_card2_title: 'लाइव्ह, इन-होम डेमो',
    vb_card2_desc:
      'आपल्या वास्तविक घरगुती वातावरणात उत्पादनाचे प्रदर्शन पाहणे अमूल्य आहे. आपली साफसफाईची आव्हाने पूर्ण करण्यासाठी आम्ही डेमो देतो.',
    vb_card3_title: 'एक्सक्लूसिव्ह ऑफर आणि बाय-बॅक',
    vb_card3_desc:
      'अधिकृत विशेषज्ञांकडे विशेष प्रचारात्मक अधिकार असतात जे ऑनलाइन उपलब्ध नसतात. यात जुन्या मॉडेल्सवरील आकर्षक बाय-बॅक ऑफर आणि कस्टम सवलतींचा समावेश आहे.',
    vb_card4_title: 'सत्यतेची हमी',
    vb_card4_desc:
      'थेट खरेदी केल्याने उत्पादन 100% अस्सल आणि फॅक्टरी-फ्रेश असल्याची हमी मिळते. यामुळे आपली वॉरंटी योग्यरित्या नोंदणीकृत होते.',
    vb_card5_title: 'समर्पित आफ्टर-सेल्स सपोर्ट',
    vb_card5_desc:
      'सामान्य हेल्पलाइनऐवजी, आपल्याला त्वरित इंस्टॉलेशन, एएमसी सेटअप आणि कुशल समस्या निवारणासाठी एका समर्पित विशेषज्ञाशी संपर्क मिळतो.',

    // ============================================
    // PRODUCTS SECTION
    // ============================================
    products_eyebrow: 'विशेष उत्पादने',
    products_title: 'निवडलेले SKU आणि ऑफलाइन-फक्त ऑफर',
    products_desc:
      'शीर्ष-गुणवत्तेच्या उत्पादनांमधून निवडा जी थेट विक्री आणि एक्सक्लूसिव ऑफलाइन चॅनेलद्वारे उपलब्ध आहेत।',
    intro_badge1: 'अधिकृत थेट विक्री',
    intro_badge2: 'मोफत होम डेमो',
    intro_badge3: 'एक्सक्लूसिव ऑफर',
    filter_all: 'सर्व उत्पादने',
    filter_water: 'जल शुद्धिकरणे',
    filter_air: 'वायु शुद्धिकरणे',
    filter_vacuum: 'व्हॅक्यूम क्लीनर',
    filter_softener: 'जल कोमल करणे',
    btn_ask: 'या SKU साठी विचारा',
    btn_check_suitability: 'सुसंगतता तपासा',
    btn_check_hard_water: 'कठोर पाण्याचे समाधान तपासा',
    btn_get_best_offer: 'सर्वोत्तम ऑफर मिळवा',
    btn_get_recommendation: 'शिफारस मिळवा',
    btn_get_details: 'तपशील मिळवा',
    btn_exchange: 'एक्सचेंज ऑफर',

    offer_eyebrow: 'मर्यादित वेळेची ऑफर',
    offer_title: 'मेगा मे डील्स!',
    offer_desc: 'आजच या अधिकृत युरेका फोर्ब्स मेगा मे डील्सचा लाभ घ्या. ऑफर मे महिन्याच्या अखेरपर्यंत वैध आहे.',
    offer_btn: 'व्हाट्सअँपवर या ऑफरवर दावा करा',

    cat_water: 'वॉटर प्युरिफायर',
    cat_water_desc: 'RO, UV, UF आणि कॉपर',
    cat_vacuum: 'व्हॅक्यूम क्लीनर',
    cat_vacuum_desc: 'रोबोटिक, कॉर्डलेस आणि ड्राय/वेट',
    cat_air: 'एअर प्युरिफायर',
    cat_air_desc: 'HEPA आणि स्मार्ट सेन्सर',
    cat_softener: 'वॉटर सॉफ्टनर',
    cat_softener_desc: 'संपूर्ण घरासाठी उपाय',
    btn_back_categories: 'श्रेण्यांकडे परत जा',

    // Product Tags
    tag_water: 'जल शुद्धिकरण',
    tag_air: 'वायु शुद्धिकरण',
    tag_vacuum: 'व्हॅक्यूम क्लीनर',
    tag_water_softener: 'जल कोमल करणे',

    // ============================================
    // CONTACT SECTION
    // ============================================
    contact_eyebrow: 'आपल्या विशेषज्ञाशी संपर्क साधा',
    contact_title: 'ऑर्डर देण्यास तयार आहात?',
    contact_desc:
      'निवडलेली उत्पादने बुक करण्यासाठी किंवा मोफत होम डेमो शेड्यूल करण्यासाठी थेट कॉल किंवा व्हाट्सएप करा.',
    contact_name: 'नाव:',
    contact_service_area: 'सेवा क्षेत्र:',
    contact_phone: 'फोन:',
    contact_email: 'ईमेल:',
    contact_whatsapp: 'व्हाट्सअँप:',
    contact_email_btn: 'ईमेल सपोर्ट',
    contact_wa_btn: 'व्हाट्सअँप केअर',
    contact_official_title: 'युरेका फोर्ब्स कस्टमर केअर',
    contact_official_phone: 'टोल-फ्री / फोन:',
    contact_official_whatsapp: 'अधिकृत व्हाट्सएप:',
    contact_official_email: 'सपोर्ट ईमेल:',

    // ============================================
    // FOOTER
    // ============================================
    footer_text1: '© 2026 यूरेका फोर्ब्स थेट विक्री विशेषज्ञ',
    footer_text2: 'आपल्या ग्राहकांसाठी निवडलेले SKU आणि ऑफलाइन-फक्त ऑफर.',
    footer_legal_link: 'कायदेशीर आणि कॉपीराइट माहिती',
    footer_disclaimer_text:
      'अस्वीकरण: ही वेबसाइट पारस सिंग चावसाली यांच्याद्वारे स्वतंत्रपणे संचालित केली जाते, जे युरोका फोर्ब्ससाठी अधिकृत थेट विक्री प्रतिनिधी आहेत. ही युरोका फोर्ब्स लिमिटेडची अधिकृत वेबसाइट नाही. या साइटवर वैशिष्ट्यीकृत किंवा संदर्भित केलेली सर्व उत्पादन नावे, लोगो, ब्रँड, ट्रेडमार्क आणि प्रतिमा या युरोका फोर्ब्स लिमिटेडची एकमेव मालमत्ता आहेत आणि थेट विक्री सुलभ करण्यासाठी केवळ माहितीपूर्ण आणि प्रात्यक्षिक हेतूंसाठी वापरली जातात. हे प्लॅटफॉर्म केवळ उत्पादन प्रदर्शन आणि चौकशी निर्मितीसाठी आहे. या वेबसाइटद्वारे कोणतेही पेमेंट किंवा आर्थिक व्यवहार प्रक्रिया केली जात नाही. सर्व अंतिम खरेदी, बिलिंग आणि इंस्टॉलेशन पूर्णपणे अधिकृत युरोका फोर्ब्स चॅनेलद्वारे हाताळले जातात.',
    header_rep_title: 'ग्राहक विक्री विशेषज्ञ',
    header_rep_badge: 'स्वतंत्र अधिकृत थेट विक्री प्रतिनिधी',

    // ============================================
    // FAQ SECTION
    // ============================================
    faq_eyebrow: 'सामान्य प्रश्न',
    faq_title: 'नेहमी विचारले जाणारे प्रश्न',
    faq_desc: 'जल शुद्धीकरण, तंत्रज्ञान आणि देखभालीबद्दलच्या सर्वात सामान्य प्रश्नांची त्वरित उत्तरे मिळवा.',
    faq_tab_aquaguards: 'ॲक्वागार्ड्स',
    faq_tab_vacuums: 'व्हॅक्यूम क्लीनर्स',
    faq_tab_service: 'सर्व्हिसिंग आणि AMC',
    faq_q1: 'जर नगरपालिका आधीच आमच्या पाण्यावर उपचार करते, तर मला ॲक्वागार्डची का गरज आहे?',
    faq_a1:
      'जरी पाणी मुख्य नगरपालिका प्रकल्पात उपचारित केले जात असले तरी, ते आपल्या इमारतीपर्यंत पोहोचण्यापूर्वी किलोमीट्रो जुन्या, गंजलेल्या भूमिगत पाइपलाईनमधून वाहते. सूक्ष्म-तडे सहसा भूमिगत सांडपाणी गळती आणि क्रॉस-दूषित होण्याचे कारण बनतात. याशिवाय, आपल्या इमारतीच्या ओव्हरहेड आणि भूमिगत स्टोरेज टाक्या दरमहा व्यावसायिकरित्या स्वच्छ केल्या जात नसल्यास, त्या गाळ, जैविक स्लाइम आणि बॅक्टेरिया जमा करतात जे पाण्याला पुन्हा दूषित करतात.',
    faq_q2: 'आम्ही तसेच घरी पाणी उकळतो. यामुळे प्युरिफायर अनावश्यक होत नाही का?',
    faq_a2:
      'उकळणे जिवंत बॅक्टेरिया आणि व्हायरस निष्क्रिय करण्यासाठी उत्कृष्ट आहे, परंतु ते रासायनिक प्रदूषकांविरुद्ध पूर्णपणे अपयशी ठरते. उकळण्याने विरघळलेली जड धातू (शिसे, आर्सेनिक किंवा मर्क्युरीसारखी), गंजाचे तुकडे, चिखलाची अस्वच्छता किंवा कृषी कीटकनाशके काढता येत नाहीत. वास्तविक, उकळण्यादरम्यान पाणी बाष्परूपाने जाताना, या धोकादायक विरघळलेल्या विषारी पदार्थांची घनता प्रत्यक्षात वाढते. याशिवाय, उकळण्याने जड क्लोरिनचा वास किंवा चव काढता येत नाही जी सहसा नगरपालिका उपचार प्रकल्पांद्वारे जोडली जाते.',
    faq_q3: '5th Gen UV LED तंत्रज्ञान नक्की काय आहे आणि ते किती काळ टिकते?',
    faq_a3:
      '5th Generation UV LED हे आधुनिक जल निर्जंतुकीकरणाचे सर्वोच्च शिखर आहे, जे जुन्या काचेच्या UV ट्यूबची जागा घेते. वार्म-अप कालावधीची आवश्यकता असलेल्या वारसदारी बल्बच्या विपरीत, 5th Gen LEDs पाणी वाहताच क्षणार्धात सक्रिय होतात, पहिल्या थेंबापासून 100% सुरक्षित पाणी सुनिश्चित करतात. ते पूर्णपणे मर्क्युरी-मुक्त आहेत, शून्य उष्णता निर्माण करतात (म्हणून आपले पाणी थंड राहते), आणि 10 वर्षांपर्यंतचा अविश्वसनीय टिकाऊ आयुष्यकाळ असतो, जो आपल्या दीर्घकालीन देखभाल खर्चात नाट्यमयपणे घट करतो.',
    faq_q4: 'वार्षिक देखभाल करार (AMC) घेणे खरोखर फायदेशीर आहे का?',
    faq_a4:
      'अगदी. आपल्या प्युरिफायरबद्दल संरक्षणात्मक ढाल म्हणून विचार करा; हे चिखल, रासायनिक कण आणि जड धातूंना शारीरिकरित्या अडकवून काम करते जेणेकरून ते आपल्या शरीरात प्रवेश करणार नाहीत. 6 ते 12 महिन्यांत, हे जड-कर्तव्य कार्बन ब्लॉक्स आणि मेंब्रेन अपरिहार्यपणे त्या गंदगीने पूर्णपणे भरले जातात ज्यांना त्यांनी अडवले. सक्रिय AMC सुनिश्चित करते की प्रमाणित तंत्रज्ञान आपल्या दारावर थेट येऊन सिस्टमची खोल साफसफाई करतो आणि अपयशी होण्यापूर्वी खऱ्या कारखाना स्पेअर्ससह कार्ट्रिज बदलतो, 365 दिवसांची तात्काळ आरोग्य सुरक्षिततेची हमी देतो.',
    faq_q5: 'मी मुंबई, नवी मुंबई किंवा ठाण्यात राहत असल्यास मला खरोखर RO प्युरिफायरची गरज आहे का?',
    faq_a5:
      'हे तुमच्या इमारतीच्या पाण्याच्या स्रोतावर अवलंबून आहे. जर तुमची सोसायटी पूर्णपणे महानगरपालिकेच्या पाण्यावर (NMMC, TMC, किंवा BMC) अवलंबून असेल, तर पाणी नैसर्गिकरित्या मऊ असते आणि रोगजंतू व गंज काढून टाकण्यासाठी UV+UF प्युरिफायर पुरेसा असतो. तथापि, जर तुमची सोसायटी बोअरवेलचे पाणी वापरत असेल किंवा खाजगी पाण्याचे टँकर मागवत असेल (जे उन्हाळ्यातील पाणी कपातीच्या वेळी सामान्य आहे), तर बदलत्या TDS (एकूण विरघळलेले घन पदार्थ) आणि कडकपणा हाताळण्यासाठी RO प्युरिफायरची शिफारस केली जाते.',
    faq_q6: 'RO प्युरिफायर माझ्या पिण्याच्या पाण्यातील आवश्यक खनिजे काढून टाकेल का?',
    faq_a6:
      'नाही. आधुनिक ॲक्वागार्ड RO मॉडेल्स पेटंट केलेल्या मिनरल गार्ड™ तंत्रज्ञानाने सुसज्ज आहेत. हे सुनिश्चित करते की जड धातू, अतिरिक्त क्षार आणि हानिकारक अशुद्धता फिल्टर केल्या जात असताना, आपल्या पिण्याच्या पाण्यात कॅल्शियम आणि मॅग्नेशियमसारखी आवश्यक नैसर्गिक खनिजे टिकून राहतात.',
    faq_q7: 'मला माझ्या ॲक्वागार्डमधील फिल्टर किती वेळा बदलण्याची गरज आहे?',
    faq_a7:
      'सामान्यतः, प्री-फिल्टर आणि कार्बन फिल्टर दर 6 ते 12 महिन्यांनी बदलणे आवश्यक असते, हे तुमच्या घरातील पाण्याच्या वापराच्या आणि येणाऱ्या पाण्याच्या गुणवत्तेवर अवलंबून असते. जर तुम्ही जुन्या GI प्लंबिंग असलेल्या भागात राहत असाल, तर सेडिमेंट फिल्टर लवकर बदलावे लागतील. फिल्टर बदलण्याची वेळ आल्यावर तुमची मशीन तुम्हाला अलर्ट देखील देईल.',
    faq_q8: 'मी माझा जुना वॉटर प्युरिफायर नवीन ॲक्वागार्डसाठी एक्सचेंज करू शकतो का?',
    faq_a8:
      'होय! आम्ही सध्या अधिकृत ॲक्वागार्ड बाय-बॅक आणि एक्सचेंज मोहीम राबवत आहोत (डिसेंबर 2026 पर्यंत वैध). तुम्ही तुमचा जुना वॉटर प्युरिफायर - ब्रँड किंवा स्थितीची पर्वा न करता - नवीन, अपग्रेडेड ॲक्वागार्ड मॉडेलवर महत्त्वपूर्ण सवलतीसाठी एक्सचेंज करू शकता. तुमच्या जुन्या मशीनचे अचूक मूल्यांकन मिळवण्यासाठी माझ्याशी व्हाट्सएपद्वारे संपर्क साधा.',
    faq_q9: 'भारतीय घरांसाठी कोणता व्हॅक्यूम क्लीनर चांगला आहे: बॅगलेस की बॅग्ड?',
    faq_a9:
      'दोन्ही अत्यंत प्रभावी आहेत, परंतु ते वेगवेगळ्या गरजा पूर्ण करतात. बॅगलेस (सायक्लोनिक) मॉडेल्स सोयीस्कर, हलके असतात आणि तुम्हाला रिप्लेसमेंट बॅग खरेदी करण्याच्या खर्चापासून वाचवतात. तथापि, ऍलर्जी असलेल्यांसाठी बॅग्ड मॉडेल्सची शिफारस केली जाते कारण विल्हेवाट लावताना धूळ पूर्णपणे बंद केली जाते, ज्यामुळे धुळीचे ढग तयार होत नाहीत.',
    faq_q10: 'मला किंवा माझ्या कुटुंबातील सदस्यांना धुळीची ऍलर्जी असल्यास व्हॅक्यूम क्लीनर मदत करू शकतो का?',
    faq_a10:
      'नक्कीच. तुम्हाला धुळीची ऍलर्जी असल्यास, आमचे फोर्ब्स मॉडेल्स पाहा जे ट्रू HEPA (हाय-एफिशियन्सी पार्टिक्युलेट एअर) फिल्टरने सुसज्ज आहेत. हे फिल्टर 99.9% सूक्ष्म ऍलर्जन्स, धुळीचे कण आणि पाळीव प्राण्यांचे केस अडकवतात, ज्यामुळे ते तुमच्या खोलीच्या हवेत परत सोडले जात नाहीत.',
    faq_q11: 'हँडहेल्ड व्हॅक्यूम क्लीनर स्टँडर्ड फ्लोअर व्हॅक्यूमची जागा घेऊ शकतो का?',
    faq_a11:
      'हँडहेल्ड व्हॅक्यूम त्वरित साफसफाई, कारचे इंटीरियर, सोफे आणि पोहोचण्यास कठीण असलेल्या कोपऱ्यांसाठी उत्कृष्ट आहेत. तथापि, मोठ्या कार्पेट्स आणि संपूर्ण मजल्यांच्या खोल साफसफाईसाठी, कॅनिस्टर किंवा रोबोटिक व्हॅक्यूम क्लीनर आवश्यक सक्शन पॉवर आणि बॅटरी लाइफ प्रदान करतो.',
    faq_q12: 'माझा व्हॅक्यूम क्लीनर गरम होऊन बंद का होतो?',
    faq_a12:
      'ही एक अंगभूत सुरक्षा सुविधा आहे. जर डस्ट बॅग पूर्णपणे भरलेली असेल, किंवा फिल्टर किंवा होसेस केस किंवा कचऱ्याने गंभीरपणे ब्लॉक झाले असतील, तर मोटर जास्त काम करते आणि गरम होते. डस्ट कप रिकामा करणे आणि फिल्टर नियमितपणे स्वच्छ केल्याने हे टाळता येईल आणि जास्तीत जास्त सक्शन पॉवर सुनिश्चित होईल.',
    faq_q13: 'मी मोफत होम डेमो कसे बुक करू?',
    faq_a13:
      'फक्त "डेमो बुक करा" बटणावर क्लिक करा किंवा मला थेट व्हाट्सएपवर संदेश पाठवा. मी नवी मुंबई आणि ठाण्यासाठी तुमचा अधिकृत स्थानिक युरेका फोर्ब्स विशेषज्ञ असल्यामुळे, मी निवडक मॉडेल्स तुमच्या घरी आणेन जेणेकरून तुम्ही निर्णय घेण्यापूर्वी ते तुमच्या स्वतःच्या जागेत कसे काम करतात ते पाहू शकाल.',
    faq_q14: 'युरेका फोर्ब्स AMC (वार्षिक देखभाल करार) अंतर्गत काय समाविष्ट आहे?',
    faq_a14:
      'एक अस्सल ॲक्वागार्ड AMC तुम्हाला पूर्ण मानसिक शांती देते. यात साधारणपणे वर्षातून 3 नियोजित देखभाल भेटी, वार्षिक फिल्टर बदलणे, टाकीची स्वच्छता, अमर्याद ब्रेकडाउन दुरुस्ती भेटी आणि तुम्ही निवडलेल्या योजनेनुसार स्पेअर पार्ट्स (इलेक्ट्रॉनिक्स आणि पंपसह) मोफत बदलणे समाविष्ट असते.',
    faq_q15: 'खरेदीनंतर माझे उत्पादन किती लवकर स्थापित केले जाईल?',
    faq_a15:
      'इन्स्टॉलेशन खूप जलद आहे. एकदा तुमची ऑर्डर निश्चित झाल्यावर, एक अधिकृत युरेका फोर्ब्स तंत्रज्ञ 24 ते 48 तासांच्या आत डिव्हाइस स्थापित करण्यासाठी तुमच्या घरी पोहोचेल.',

    // ============================================
    // DEMO FORM
    // ============================================
    // ============================================
    // LEGAL TERMS PAGE
    // ============================================
    legal_title: 'कायदेशीर आणि कॉपीराइट माहिती',
    legal_subtitle: 'या स्वतंत्र विक्री पोर्टफोलिओच्या कार्याशी संबंधित महत्त्वपूर्ण कायदेशीर अस्वीकरणे.',
    legal_s1_title: 'बौद्धिक संपदा आणि कॉपीराइट स्वीकृती',
    legal_s1_text:
      'या वेबसाइटवर प्रदान केलेली सामग्री केवळ शैक्षणिक आणि विक्री चौकशीच्या उद्देशांसाठी आहे. मी, एक अधिकृत थेट विक्रेता म्हणून, संभाव्य ग्राहकांना वॉटर प्युरिफायर, व्हॅक्यूम क्लीनर आणि इतर उत्पादनांचे अचूक प्रतिनिधित्व करण्यासाठी अधिकृत उत्पादन प्रतिमा आणि तपशील वापरतो. कोणतेही कॉपीराइट उल्लंघन हेतू नाही. सर्व उत्पादन प्रतिमा, मालकी तंत्रज्ञान नावे आणि ब्रँड मालमत्तांचे बौद्धिक संपदा अधिकार पूर्णपणे युरोका फोर्ब्स लिमिटेडकडे राहतात.',
    legal_s2_title: 'कोणतेही ई-कॉमर्स व्यवहार नाहीत',
    legal_s2_text:
      'ग्राहक सुरक्षा सुनिश्चित करण्यासाठी आणि अधिकृत विक्री प्रोटोकॉलचे पालन करण्यासाठी, या वेबसाइटवर कोणतेही पेमेंट गेटवे नाहीत. अभ्यागत या साइटवर थेट उत्पादने खरेदी करू शकत नाहीत. येथे दिलेल्या माहितीचे पुनरावलोकन केल्यानंतर तुम्हाला उत्पादन खरेदी करायचे असल्यास, मी युरोका फोर्ब्स लिमिटेडने निर्धारित केलेल्या अधिकृत दस्तऐवजीकरण आणि पेमेंट प्रक्रियेत वैयक्तिकरित्या तुम्हाला मदत करेन.',
    legal_s3_title: 'गोपनीयता आणि डेटा संकलन',
    legal_s3_text:
      'या वेबसाइटवर फॉर्मद्वारे सबमिट केलेली कोणतीही वैयक्तिक माहिती (जसे की नाव, फोन नंबर आणि पत्ता) केवळ प्रात्यक्षिके, पाणी चाचण्या किंवा उत्पादनाची माहिती प्रदान करण्याच्या उद्देशाने वापरली जाते. तुमचा डेटा कधीही अनधिकृत तृतीय पक्षांना विकला किंवा सामायिक केला जात नाही.',
    legal_s4_title: 'उत्तरदायित्वाची मर्यादा',
    legal_s4_text:
      'उत्पादन तपशील, वैशिष्ट्ये आणि किमती अचूक आहेत याची खात्री करण्यासाठी प्रत्येक प्रयत्न केला जात असला तरी, हे तपशील पूर्वसूचनेशिवाय युरेका फोर्ब्स लिमिटेडद्वारे बदलले जाऊ शकतात. या वेबसाइटच्या ऑपरेटरला कोणत्याही विसंगतीसाठी जबाबदार धरले जाणार नाही.',

    demo_form_name_placeholder: 'आपले नाव प्रविष्ट करा',
    demo_form_phone_placeholder: 'फोन नंबर प्रविष्ट करा',
    demo_form_email_placeholder: 'ईमेल आयडी प्रविष्ट करा',
    demo_form_address_placeholder: 'पूर्ण पत्ता प्रविष्ट करा',

    demo_form_title: 'मोफत डेमो बुक करा',
    demo_form_btn: 'सबमिट करा आणि व्हाट्सअँपद्वारे पाठवा',
    search_placeholder: 'उत्पादने शोधा...',
    share_btn: 'व्हाट्सअँपवर शेअर करा',
    share_fb_btn: 'फेसबुकवर शेअर करा',
    share_copy_btn: 'लिंक कॉपी करा',
    error_title: 'पृष्ठ आढळले नाही',
    error_desc:
      'तुम्ही शोधत असलेले पृष्ठ काढून टाकले गेले असावे, त्याचे नाव बदलले गेले असेल किंवा तात्पुरते अनुपलब्ध असेल.',
    error_btn: 'होमपेजवर परत जा',
  },
};

/**
 * Language Switcher - Complete Implementation
 *
 * This module handles all language switching functionality:
 * 1. Attaches click listeners to all .lang-btn elements
 * 2. Toggles the 'active' class between buttons
 * 3. Updates all elements with data-i18n attribute
 * 4. Handles input/textarea placeholders gracefully
 * 5. Saves language preference to localStorage
 * 6. Protects product SKU names from translation (always English)
 */
(function () {
  'use strict';

  // Current active language (defaults to English)
  let currentLang = 'en';

  /**
   * Apply translations for the given language code
   * Safely handles null references and different element types
   *
   * @param {string} lang - Language code ('en', 'hi', or 'mr')
   */
  function applyTranslations(lang) {
    if (!translations[lang]) {
      console.warn(`[i18n] translations.js: Language '${lang}' not found. Falling back to 'en'.`);
      lang = 'en';
    }

    currentLang = lang;
    document.documentElement.lang = lang;

    // Query all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      const translation = translations[lang][key];
      if (!translation) {
        // Silently skip missing translations (keeps fallback English text)
        return;
      }

      // Handle different element types appropriately
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'input' || tagName === 'textarea') {
        // For form inputs, update placeholder attribute
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translation;
        }
      } else {
        // For regular elements, update textContent
        el.textContent = translation;
      }
    });

    // Update demo form placeholders specifically
    const demoName = document.getElementById('demo-name');
    const demoPhone = document.getElementById('demo-phone');
    const demoEmail = document.getElementById('demo-email');
    const demoAddress = document.getElementById('demo-address');

    if (demoName) demoName.placeholder = translations[lang].demo_form_name_placeholder || demoName.placeholder;
    if (demoPhone) demoPhone.placeholder = translations[lang].demo_form_phone_placeholder || demoPhone.placeholder;
    if (demoEmail) demoEmail.placeholder = translations[lang].demo_form_email_placeholder || demoEmail.placeholder;
    if (demoAddress)
      demoAddress.placeholder = translations[lang].demo_form_address_placeholder || demoAddress.placeholder;

    // Save preference to localStorage
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch (e) {
      // localStorage may not be available in some contexts
    }
  }

  /**
   * Initialize the language switcher
   * Attaches click handlers to all .lang-btn elements
   */
  function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn[data-lang]');

    langButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Remove active class from all buttons
        langButtons.forEach(function (b) {
          b.classList.remove('active');
        });

        // Add active class to clicked button
        this.classList.add('active');

        // Get language code and apply translations
        const lang = this.getAttribute('data-lang');
        if (lang) {
          applyTranslations(lang);
        }
      });
    });

    // Load saved language preference
    try {
      const savedLang = localStorage.getItem('preferredLanguage') || 'en';
      if (savedLang !== 'en') {
        const savedBtn = document.querySelector(`[data-lang="${savedLang}"]`);
        if (savedBtn) {
          // Programmatically trigger the click to activate the saved language
          savedBtn.click();
        }
      }
    } catch (e) {
      // localStorage may not be available
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    // DOM is already loaded
    initLanguageSwitcher();
  }

  // Expose applyTranslations globally for any external use
  window.applyTranslations = applyTranslations;
})();
