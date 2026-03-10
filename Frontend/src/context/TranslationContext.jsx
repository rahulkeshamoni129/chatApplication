import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        searchMessages: "Search messages...",
        typeAMessage: "Type a message...",
        blockedUser: "You have blocked this user",
        editingMessage: "Editing message",
        replyingTo: "Replying to",
        online: "online",
        offline: "offline",
        lastSeen: "last seen",
        justNow: "just now",
        members: "members",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        changeLanguage: "Change Language",
        allUsers: "All Users",
        groups: "Groups",
        newGroup: "New Group",
        search: "Search",
        pin: "Pin",
        unpin: "Unpin",
        block: "Block",
        unblock: "Unblock",
        delete: "Delete",
        edit: "Edit",
        star: "Star",
        unstar: "Unstar",
    },
    hi: {
        searchMessages: "संदेश खोजें...",
        typeAMessage: "संदेश लिखें...",
        blockedUser: "आपने इस उपयोगकर्ता को ब्लॉक कर दिया है",
        editingMessage: "संदेश संपादित कर रहे हैं",
        replyingTo: "जवाब दे रहे हैं",
        online: "ऑनलाइन",
        offline: "ऑफ़लाइन",
        lastSeen: "पिछली बार देखा गया",
        justNow: "अभी",
        members: "सदस्य",
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल",
        logout: "लॉगआउट",
        changeLanguage: "भाषा बदलें",
        allUsers: "सभी उपयोगकर्ता",
        groups: "समूह",
        newGroup: "नया समूह",
        search: "खोजें",
        pin: "पिन करें",
        unpin: "पिन हटाएं",
        block: "ब्लॉक करें",
        unblock: "अनब्लॉक करें",
        delete: "हटाएं",
        edit: "संपादित करें",
        star: "तारांकित करें",
        unstar: "तारांकित हटाएं",
    },
    es: {
        searchMessages: "Buscar mensajes...",
        typeAMessage: "Escribe un mensaje...",
        blockedUser: "Has bloqueado a este usuario",
        editingMessage: "Editando mensaje",
        replyingTo: "Respondiendo a",
        online: "en línea",
        offline: "desconectado",
        lastSeen: "visto por última vez",
        justNow: "ahora mismo",
        members: "miembros",
        settings: "Ajustes",
        profile: "Perfil",
        logout: "Cerrar sesión",
        changeLanguage: "Cambiar idioma",
        allUsers: "Todos los usuarios",
        groups: "Grupos",
        newGroup: "Nuevo grupo",
        search: "Buscar",
        pin: "Fijar",
        unpin: "Desfijar",
        block: "Bloquear",
        unblock: "Desbloquear",
        delete: "Eliminar",
        edit: "Editar",
        star: "Destacar",
        unstar: "Quitar destacado",
    }
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('chatLang') || 'en');

    useEffect(() => {
        localStorage.setItem('chatLang', lang);
    }, [lang]);

    const t = (key) => translations[lang][key] || key;

    return (
        <TranslationContext.Provider value={{ lang, setLang, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => useContext(TranslationContext);
