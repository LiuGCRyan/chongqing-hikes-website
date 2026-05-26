// Custom Language Switcher for Google Translate
// Replaces the default ugly Google Translate widget

function googleTranslateElementInit() {
    // Initialize Google Translate (hidden)
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,fr,es,ru,de,ko',
        layout: google.translate.TranslateElement.InlineLayout.VERTICAL,
        autoDisplay: false
    }, 'google_translate_element');
}

// Custom language switcher
class LanguageSwitcher {
    constructor() {
        this.currentLang = 'en';
        this.languages = [
            { code: 'en', name: 'English', native: 'English' },
            { code: 'fr', name: 'French', native: 'Français' },
            { code: 'es', name: 'Spanish', native: 'Español' },
            { code: 'ru', name: 'Russian', native: 'Русский' },
            { code: 'de', name: 'German', native: 'Deutsch' },
            { code: 'ko', name: 'Korean', native: '한국어' }
        ];
        this.init();
    }

    init() {
        this.createWidget();
        this.bindEvents();
        this.checkCurrentLanguage();
    }

    createWidget() {
        const container = document.getElementById('language-switcher');
        if (!container) return;

        container.innerHTML = `
            <div class="lang-switcher">
                <button class="lang-trigger" id="lang-trigger" type="button">
                    <span class="lang-icon">🌐</span>
                    <span class="lang-text">EN</span>
                    <span class="lang-arrow">▼</span>
                </button>
                <div class="lang-dropdown" id="lang-dropdown">
                    ${this.languages.map(lang => `
                        <div class="lang-option" data-lang="${lang.code}">
                            <span class="lang-native">${lang.native}</span>
                            <span class="lang-name">${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        const trigger = document.getElementById('lang-trigger');
        const dropdown = document.getElementById('lang-dropdown');

        if (!trigger || !dropdown) return;

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Select language
        dropdown.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = option.dataset.lang;
                this.changeLanguage(lang);
                dropdown.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    }

    changeLanguage(langCode) {
        // Set Google Translate cookie
        const cookie = `googtrans=/en/${langCode}`;
        document.cookie = cookie + '; path=/';
        
        // Reload page to apply translation
        location.reload();
    }

    checkCurrentLanguage() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('googtrans='));
        
        if (cookie) {
            const lang = cookie.split('=')[1].split('/')[2];
            this.currentLang = lang;
            this.updateUI(lang);
        }
    }

    updateUI(langCode) {
        const lang = this.languages.find(l => l.code === langCode);
        if (lang) {
            const trigger = document.getElementById('lang-trigger');
            if (trigger) {
                trigger.querySelector('.lang-text').textContent = lang.code.toUpperCase();
            }
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Google Translate to load
    if (window.google && window.google.translate) {
        new LanguageSwitcher();
    } else {
        // Retry after a delay
        setTimeout(() => new LanguageSwitcher(), 1000);
    }
});
