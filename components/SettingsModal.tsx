import React, { useState, useEffect } from 'react';
import { AiConfig, AiProvider } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import clsx from 'clsx';
import { LmStudioService } from '../services/lmstudio_service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onSave: (newConfig: AiConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const { t } = useLanguage();
  const [currentConfig, setCurrentConfig] = useState<AiConfig>(config);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setCurrentConfig(config);
  }, [config, isOpen]);

  const handleProviderChange = (provider: AiProvider) => {
    setCurrentConfig(prev => ({ ...prev, provider }));
  };

  const handleLmStudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentConfig(prev => ({
      ...prev,
      lmStudio: { ...prev.lmStudio, [name]: value }
    }));
  };

  const handleTestConnection = async () => {
    if (currentConfig.provider !== 'lmstudio') return;
    setTestStatus('testing');
    const service = new LmStudioService(currentConfig.lmStudio);
    const success = await service.testConnection();
    setTestStatus(success ? 'success' : 'error');
    setTimeout(() => setTestStatus('idle'), 3000);
  };
  
  const handleSave = () => {
    onSave(currentConfig);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-cyan-400">{t('config.ai_settings.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('config.ai_settings.provider')}</label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => handleProviderChange('gemini')}
                className={clsx(
                  'px-4 py-2 text-sm font-medium transition-colors border border-gray-600 rounded-l-md w-1/2',
                  currentConfig.provider === 'gemini' 
                    ? 'bg-cyan-600 text-white border-cyan-500 z-10' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                Google Gemini
              </button>
              <button
                onClick={() => handleProviderChange('lmstudio')}
                className={clsx(
                  'px-4 py-2 text-sm font-medium transition-colors border-y border-r border-gray-600 rounded-r-md w-1/2',
                  currentConfig.provider === 'lmstudio' 
                    ? 'bg-cyan-600 text-white border-cyan-500 z-10' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                LM Studio
              </button>
            </div>
          </div>
          
          <div className={clsx("transition-opacity duration-500", currentConfig.provider !== 'gemini' && 'opacity-30 pointer-events-none')}>
             <div className="space-y-1">
                 <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-300">{t('config.ai_settings.gemini_api_key')}</label>
                <input
                    type="password"
                    id="gemini-key"
                    disabled
                    value="STORED_IN_ENV_FILE"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 text-sm cursor-not-allowed"
                />
             </div>
          </div>

          <div className={clsx("transition-opacity duration-500", currentConfig.provider !== 'lmstudio' && 'opacity-30 pointer-events-none')}>
            <div className="space-y-4">
              <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-300">{t('config.ai_settings.lmstudio_url')}</label>
                <input
                  type="text"
                  name="baseUrl"
                  id="baseUrl"
                  value={currentConfig.lmStudio.baseUrl}
                  onChange={handleLmStudioChange}
                  disabled={currentConfig.provider !== 'lmstudio'}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-300">{t('config.ai_settings.lmstudio_model')}</label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={currentConfig.lmStudio.model}
                  onChange={handleLmStudioChange}
                  placeholder={t('config.ai_settings.lmstudio_model_placeholder')}
                  disabled={currentConfig.provider !== 'lmstudio'}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
               <button 
                onClick={handleTestConnection}
                disabled={currentConfig.provider !== 'lmstudio' || testStatus === 'testing'}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait"
               >
                 {testStatus === 'testing' ? 'Testing...' : t('config.ai_settings.test_connection')}
               </button>
               {testStatus === 'success' && <p className="text-sm text-green-400 text-center">{t('config.ai_settings.test_success')}</p>}
               {testStatus === 'error' && <p className="text-sm text-red-400 text-center">{t('config.ai_settings.test_fail')}</p>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-right">
          <button
            onClick={handleSave}
            className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
          >
            {t('config.ai_settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
