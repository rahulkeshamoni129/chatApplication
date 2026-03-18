import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/Authprovider';
import { generateE2EEKeys, protectPrivateKey, unprotectPrivateKey } from '../utils/cryptoUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoShieldCheckmarkOutline, IoSyncOutline, IoKeyOutline } from 'react-icons/io5';
import useConversation from '../zustand/useConversation';

const SecuritySync = () => {
    const [authUser, setAuthUser] = useAuth();
    const { updateSecurityUpdate } = useConversation();
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('SETUP'); // SETUP or SYNC
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkSecurityStatus = async () => {
            if (!authUser?.user) return;

            // Key Synchronization / Identity Verification Logic:
            // We use sessionStorage for the private key so the user must enter their PIN 
            // once per browser session. This is more secure than localStorage.
            const sessionPrivateKey = sessionStorage.getItem(`e2ee_private_key_${authUser.user._id}`);
            const serverEncryptedKey = authUser.user.encryptedPrivateKey;

            // SCENARIO 1: First time setup (Server has no key)
            if (!serverEncryptedKey) {
                setModalType('SETUP');
                setShowModal(true);
            }
            // SCENARIO 2: Key exists on server but not in this session
            else if (!sessionPrivateKey) {
                setModalType('SYNC'); // This covers both new device (SYNC) and re-login (VERIFY)
                setShowModal(true);
            }
        };

        checkSecurityStatus();
    }, [authUser]);

    const handleAction = async (e) => {
        e.preventDefault();
        if (pin.length < 4) return toast.error("PIN must be at least 4 characters");

        setLoading(true);
        try {
            if (modalType === 'SETUP') {
                // 1. Generate new E2EE Keys
                const { publicKey, privateKey } = await generateE2EEKeys();
                
                // 2. Protect Private Key with PIN
                const encryptedPrivateKey = await protectPrivateKey(privateKey, pin, authUser.user._id);
                
                // 3. Save to server and session
                await axios.put('/api/users/update-public-key', { publicKey, encryptedPrivateKey });
                sessionStorage.setItem(`e2ee_private_key_${authUser.user._id}`, privateKey);
                
                // 4. Update state
                const updatedUser = { 
                    ...authUser, 
                    user: { ...authUser.user, publicKey, encryptedPrivateKey } 
                };
                localStorage.setItem("chatApp", JSON.stringify(updatedUser));
                setAuthUser(updatedUser);
                toast.success("Security keys generated and synced!");
            } 
            else {
                // SYNC / VERIFY mode
                try {
                    const decryptedKey = await unprotectPrivateKey(authUser.user.encryptedPrivateKey, pin, authUser.user._id);
                    sessionStorage.setItem(`e2ee_private_key_${authUser.user._id}`, decryptedKey);
                    toast.success("Identity verified successfully!");
                } catch (err) {
                    throw new Error("Incorrect Security PIN. Verification failed.");
                }
            }
            updateSecurityUpdate(); // REFRESH DATA GLOBAL
            setShowModal(false);
        } catch (error) {
            toast.error(error.message || "Security sync failed");
        } finally {
            setLoading(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-base-300/60 backdrop-blur-md p-4">
            <div className="bg-base-100 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-base-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-primary/5 p-8 text-center border-b border-base-200">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        {modalType === 'SETUP' ? <IoShieldCheckmarkOutline size={32} /> : <IoSyncOutline size={32} />}
                    </div>
                    <h2 className="text-xl font-black tracking-tight mb-2">
                        {modalType === 'SETUP' ? 'Initialize Privacy' : 'Identity Verification'}
                    </h2>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40 leading-relaxed px-4">
                        {modalType === 'SETUP' 
                            ? 'Create a PIN to protect and sync your private messages across devices.' 
                            : 'Enter your Security PIN to decrypt your end-to-end encrypted chats.'}
                    </p>
                </div>

                <form onSubmit={handleAction} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Your Security PIN</label>
                        <div className="relative">
                            <IoKeyOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50" size={18} />
                            <input 
                                type="password" 
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••••"
                                className="input input-bordered w-full h-14 pl-12 rounded-2xl bg-base-200 border-none font-black text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary btn-block h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : (modalType === 'SETUP' ? 'Initialize Security' : 'Unlock & Sync')}
                    </button>

                    {modalType === 'SETUP' && (
                        <p className="text-[9px] text-center font-bold opacity-30 uppercase leading-normal px-4">
                            Important: If you forget this PIN, you will lose access to your old messages on new devices.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SecuritySync;
