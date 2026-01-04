import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

export const FeatureLayout = ({
    children,
    title,
    description,
    icon: Icon,
    gradient = 'from-brand-red to-brand-pink'
}) => {
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-full p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate('/tools')}
                    className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all ${isDarkMode
                            ? 'text-brand-blue/70 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Tools</span>
                </button>

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
                        <Icon size={40} className="text-white" />
                    </div>
                    <h1 className={`text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                        {description}
                    </p>
                </div>

                {/* Content */}
                <div className={`rounded-3xl border p-8 ${isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white border-gray-200 shadow-xl'
                    }`}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
