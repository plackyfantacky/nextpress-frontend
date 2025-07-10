import ContactForm7 from '@/components/shortcodes/ContactForm7/ContactForm7.jsx';

const shortcodeRenderes = {
    'contact-form-7': ContactForm7,
};

export function getShortcodeRenderer(name) {
    return shortcodeRenderes[name] || null;
}