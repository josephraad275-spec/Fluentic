import React from 'react';
import { 
  Sparkles, 
  Coffee, 
  Compass, 
  History, 
  Briefcase, 
  Flame, 
  Scale, 
  Shield, 
  Crown, 
  Play, 
  Check, 
  Lock 
} from 'lucide-react';
import { LearningNode, CefrLevel, UserProfile, Language } from '../../types';
import { AICurriculumEngine } from '../../services/aiCurriculumService';
import { audioSynth } from '../../services/audioSynthesizer';

interface ConstellationGalaxyViewProps {
  user: UserProfile;
  activeLanguage: Language;
  activeCefr: CefrLevel;
  onSelectNode: (node: LearningNode) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Coffee,
  Compass,
  History,
  Briefcase,
  Flame,
  Scale,
  Shield,
  Crown,
};

export const ConstellationGalaxyView: React.FC<ConstellationGalaxyViewProps> = ({
  user,
  activeLanguage,
  activeCefr,
  onSelectNode,
}) => {
  const currentNodes = AICurriculumEngine.generateProceduralNodes(
    activeLanguage,
    user.nativeLanguageCode || 'en',
    activeCefr
  );

  return (
    <div
      id="fluentic-constellation-galaxy-view"
      className="relative w-full min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 flex flex-col items-center justify-start overflow-hidden"
    >
      {/* View Header Info */}
      <div className="max-w-3xl w-full text-center mb-6 space-y-1.5 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-sm">
          <span className="text-base leading-none">{activeLanguage.flag}</span>
          <span>{activeLanguage.name} Skill Map</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px]">
            {activeCefr} Level
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Learning Map
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Pick any topic below to practice. No heart limits, learn at your own pace, and earn crowns & gems as you level up!
        </p>
      </div>

      {/* Celestial SVG Vector Links & Nodes Canvas */}
      <div className="relative w-full max-w-4xl min-h-[480px] sm:min-h-[560px] rounded-3xl bg-white/70 border border-slate-200/90 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 flex items-center justify-center">
        {/* Orbital Background Circles & Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-200/80">
          <circle cx="50%" cy="50%" r="140" fill="none" strokeDasharray="4 6" strokeWidth="1.5" />
          <circle cx="50%" cy="50%" r="240" fill="none" strokeDasharray="3 8" strokeWidth="1" />
          <path
            d="M 160 220 Q 350 140 540 260 T 780 200"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeOpacity="0.4"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Nodes Grid / Celestial Positions */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl">
          {currentNodes.map((node, index) => {
            const IconComponent = ICON_MAP[node.iconName] || Sparkles;
            const isCompleted = user.completedNodeIds.includes(node.id);
            const crowns = user.nodeCrowns[node.id] || (isCompleted ? 1 : 0);

            return (
              <div
                key={node.id}
                id={`constellation-node-${node.id}`}
                className="group relative flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Crown Mastery Level Badge */}
                <div className="absolute -top-3 flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-sm">
                  <Crown className="w-3 h-3 fill-white" />
                  <span>Crown {crowns}/5</span>
                </div>

                {/* Node Orbital Icon Button */}
                <button
                  id={`launch-node-${node.id}-btn`}
                  onClick={() => {
                    audioSynth.playGentleFeedback();
                    onSelectNode(node);
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/20 group-hover:scale-105'
                  }`}
                >
                  <IconComponent className="w-8 h-8" />
                </button>

                {/* Title & Description */}
                <div className="mt-3 space-y-1">
                  <div className="font-extrabold text-slate-900 text-base leading-tight">
                    {node.title}
                  </div>
                  <div className="text-xs font-semibold text-amber-700 italic">
                    {node.nativeTitle}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {node.description}
                  </p>
                </div>

                {/* Reward & Start Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="text-amber-600">+{node.xpReward} XP</span>
                    <span>•</span>
                    <span className="text-cyan-600">+{node.gemReward} 💎</span>
                  </div>

                  <button
                    onClick={() => {
                      audioSynth.playGentleFeedback();
                      onSelectNode(node);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 group-hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>{isCompleted ? 'Practice Again' : 'Start Lesson'}</span>
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
