import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Lightbulb, Search, PenTool, History, Layers, ArrowRightLeft, Copy, Split, MessageCircle, Volume2, Square, Loader2 } from 'lucide-react';
import { WordData, StudentLevel, ThemeColor } from '../types';

interface WordCardProps {
  data: WordData;
  level: StudentLevel;
  themeColor: ThemeColor;
  onRelatedWordClick: (word: string) => void;
  language: 'korean' | 'english';
}

export const WordCard: React.FC<WordCardProps> = ({ data, level, themeColor, onRelatedWordClick, language }) => {
  const isElementary = level === StudentLevel.ELEMENTARY;
  
  // Audio states
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Regex to filter out bracketed English translation text in Korean mode
  const filterSentenceText = (text: string) => {
    if (!text) return '';
    if (language === 'korean') {
      // Matches parenthesized English sentences (e.g., "(People in the Joseon Dynasty carried out...)")
      // and replaces them with an empty string, keeping only the Korean text.
      return text.replace(/\s*\([^)]*[a-zA-Z]{3,}[^)]*\)/g, '').trim();
    }
    return text;
  };

  // Mobile-compatible speech synthesis player
  const playAudio = (textToSpeak: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }

    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    setLoadingAudioIndex(index);

    // 📱 MOBILE AUDIO UNLOCK TRICK:
    // Mobile OS blocks SpeechSynthesis unless activated synchronously inside a user click thread.
    // Triggering an empty dummy utterance immediately satisfies this security check.
    const dummyUtterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(dummyUtterance);

    // Clean up text for speech synthesis (always read the filtered text for a cleaner auditory experience)
    const cleanText = filterSentenceText(textToSpeak);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect language script (Korean vs English) to load the appropriate voice synthesis model
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cleanText);
    utterance.lang = hasKorean ? 'ko-KR' : 'en-US';

    // Map system voices safely
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(hasKorean ? 'ko' : 'en'));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onstart = () => {
      setLoadingAudioIndex(null);
      setPlayingIndex(index);
    };

    utterance.onend = () => {
      setPlayingIndex(null);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setLoadingAudioIndex(null);
      setPlayingIndex(null);
    };

    // Small timeout ensures mobile browsers catch up with voice loading
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  // Logic to distinguish Homonyms vs Polysemes
  const hasMultipleMeanings = data.meanings.length > 1;
  const distinctOrigins = new Set(data.meanings.map(m => (m.hanja || m.etymology || 'NATIVE_ORIGIN').trim()));
  const isHomonym = hasMultipleMeanings && distinctOrigins.size > 1;
  const isPolysemous = hasMultipleMeanings && !isHomonym;

  return (
    <div className="w-full space-y-8 animate-card-entrance">
      <div className={`w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100`}>
        <div className={`p-6 sm:p-8 ${isElementary ? 'bg-green-50' : 'bg-slate-50'}`}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-3">
                    {/* Show top emoji only if it's NOT a homonym, to avoid confusion. */}
                    {!isHomonym && data.emoji && <span className="text-4xl sm:text-5xl filter drop-shadow-sm">{data.emoji}</span>}
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight">{data.word}</h2>
                </div>

                <div className="flex items-center gap-2">
                    {data.pronunciation && <span className="text-slate-500 text-lg font-mono tracking-tight mr-1">[{data.pronunciation}]</span>}
                    
                    {/* Pronounce the main word */}
                    <button 
                      onClick={() => playAudio(data.word, 9999)}
                      disabled={loadingAudioIndex === 9999}
                      className={`p-2 rounded-full transition-all flex items-center justify-center border shadow-sm ${
                        playingIndex === 9999 
                          ? `bg-${themeColor}-100 border-${themeColor}-200 text-${themeColor}-600` 
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title="단어 읽어주기"
                    >
                      {loadingAudioIndex === 9999 ? (
                        <Loader2 size={18} className="animate-spin text-slate-400" />
                      ) : playingIndex === 9999 ? (
                        <Square size={14} className="fill-current" />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 items-center">
                {isHomonym && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isElementary ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                    <Split size={12} /> 동음이의어
                  </span>
                )}
                
                {isPolysemous && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isElementary ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                    <Layers size={12} /> 다의어
                  </span>
                )}

                {data.tags?.length > 0 && data.tags.map((tag, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-md bg-white/60 border border-slate-200/60 text-slate-500 font-medium`}>#{tag}</span>
                ))}
            </div>
        </div>
      </div>

      {data.meanings.map((meaning, idx) => {
        // Combined definition & example text for continuous audio reading if speaker is clicked
        const textToSpeak = `${data.word}. ${meaning.context}의 뜻은, ${meaning.definition}. 예를 들어, ${meaning.exampleSentence}`;
        const filteredExample = filterSentenceText(meaning.exampleSentence);

        return (
          <div key={idx} className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative">
            <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-sm ${idx === 0 ? `bg-${themeColor}-500` : 'bg-slate-400'}`}>{idx + 1}</span>
                    {meaning.emoji && <span className="text-2xl filter drop-shadow-sm ml-1" role="img" aria-label={meaning.context}>{meaning.emoji}</span>}
                    <h3 className={`text-xl font-bold text-slate-800 ml-1`}>{meaning.context}</h3>
                    {meaning.hanja && <span className="text-xl text-slate-700 font-black font-serif ml-1 tracking-wide">({meaning.hanja})</span>}
                </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
                        <BookOpen size={14} /> 뜻 <span className="text-slate-900 font-extrabold ml-1">({meaning.englishTranslation})</span>
                    </div>
                    <p className={`text-lg sm:text-xl leading-relaxed font-medium text-slate-800 break-keep`}>{meaning.definition}</p>
                </div>
                
                {/* Example sentence box featuring dynamic bracket language filtering & TTS */}
                <div className={`p-4 rounded-xl bg-amber-50 border border-amber-100 relative overflow-hidden flex justify-between items-end gap-4`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Sparkles size={48} className="text-amber-500" /></div>
                    <p className="text-lg text-slate-700 italic leading-loose relative z-10 break-keep flex-grow">"{filteredExample}"</p>
                    
                    {/* Read the example sentence */}
                    <button 
                      onClick={() => playAudio(meaning.exampleSentence, idx)}
                      disabled={loadingAudioIndex === idx}
                      className={`p-2.5 rounded-full transition-all shrink-0 flex items-center justify-center border ${
                        playingIndex === idx 
                          ? `bg-${themeColor}-100 border-${themeColor}-200 text-${themeColor}-600` 
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                      } relative z-10`}
                      title="예문 읽어주기"
                    >
                      {loadingAudioIndex === idx ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : playingIndex === idx ? (
                        <Square size={14} className="fill-current" />
                      ) : (
                        <Volume2 size={16} />
                      )}
                    </button>
                </div>

                {(meaning.synonyms?.length > 0 || meaning.antonyms?.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {meaning.synonyms?.length > 0 && (
                             <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider"><Copy size={12} /> 유의어</span>
                                <div className="flex flex-wrap gap-2">{meaning.synonyms.map((s, i) => <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-sm font-medium shadow-sm">{s}</span>)}</div>
                             </div>
                        )}
                         {meaning.antonyms?.length > 0 && (
                             <div className="flex flex-col gap-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                                <span className="flex items-center gap-1 text-xs font-bold text-red-400 uppercase tracking-wider"><ArrowRightLeft size={12} /> 반의어</span>
                                <div className="flex flex-wrap gap-2">{meaning.antonyms.map((s, i) => <span key={i} className="px-2 py-1 bg-white border border-red-100 rounded text-red-700 text-sm font-medium shadow-sm">{s}</span>)}</div>
                             </div>
                        )}
                    </div>
                )}

                {((meaning.etymology && meaning.etymology.length > 2) || (meaning.wordStructure && meaning.wordStructure.length > 2)) && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-sm mt-2">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase tracking-wider"><History size={14} /> {isElementary ? '단어의 비밀' : '어원 풀이'}</div>
                         <p className="text-slate-700 leading-relaxed whitespace-pre-line break-keep">{meaning.etymology}{meaning.wordStructure && `\n\n${meaning.wordStructure}`}</p>
                    </div>
                )}
            </div>
          </div>
        );
      })}

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-6">
        {/* Idioms Section */}
        {data.idioms && data.idioms.length > 0 && (
          <div className="mb-6">
             <div className="flex items-center gap-2 mb-3 text-orange-600 font-bold text-sm uppercase tracking-wider">
               <MessageCircle size={18} /> 관용구 및 속담
             </div>
             <div className="grid gap-3 sm:grid-cols-2">
               {data.idioms.map((item, i) => (
                 <div key={i} className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/60 shadow-sm hover:border-orange-200 transition-colors">
                   <div className="font-bold text-slate-800 mb-1">{item.expression}</div>
                   <div className="text-sm text-slate-600 leading-relaxed">{item.meaning}</div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {data.relatedWords?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-violet-600 font-bold text-sm uppercase tracking-wider"><Lightbulb size={18} /> 함께 배우면 좋은 단어</div>
            <div className="flex flex-wrap gap-2.5">
              {data.relatedWords.map((item, i) => (
                <button key={i} onClick={() => onRelatedWordClick(item.word)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-violet-700 hover:bg-violet-100 transition-colors border border-violet-200 text-base font-medium shadow-sm">
                  <span className="text-lg leading-none filter drop-shadow-sm">{item.emoji}</span>
                  <span>{item.word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {data.literacyImprovement && (
          <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-sm uppercase tracking-wider"><PenTool size={18} /> 문해력 쑥쑥</div>
            <p className="text-lg text-slate-700 leading-loose whitespace-pre-line break-keep">{data.literacyImprovement}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCard;
