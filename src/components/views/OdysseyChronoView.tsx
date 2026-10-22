import React from 'react';
import { 
  Check, 
  Sparkles, 
  Play, 
  Award, 
  Crown, 
  Flag, 
  Flame, 
  BookOpen 
} from 'lucide-react';
import { LearningNode, CefrLevel, UserProfile, Language } from '../../types';
import { AICurriculumEngine } from '../../services/aiCurriculumService';
import { audioSynth } from '../../services/audioSynthesizer';

interface OdysseyChronoViewProps {
  user: UserProfile;
  activeLanguage: Language;
  activeCefr: CefrLevel;
  onSelectNode: (node: LearningNode) => void;
}

export const OdysseyChronoView: React.FC<OdysseyChronoViewProps> = ({
  user,
  activeLanguage,
  activeCefr,
  onSelectNode,
}) => {
  const allLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div
      id="fluentic-odyssey-chrono-view"
      className="w-full max-w-4xl mx-auto min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <Flag className="w-3.5 h-3.5" />
          <span>Step-by-Step Path • {activeLanguage.name}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Learning Journey
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Take it one step at a time! Start from the basics (A1) and work your way up to speaking like a native (C2).
        </p>
      </div>

      {/* Chrono Stream Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        {allLevels.map((lvl) => {
          const nodes = AICurriculumEngine.generateProceduralNodes(
            activeLanguage,
            user.nativeLanguageCode || 'en',
            lvl
          );
          const isCurrentLevel = activeCefr === lvl;

          return (
            <div key={lvl} className="relative space-y-4">
              {/* Level Milestone Marker */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-md border-2 ${
                    isCurrentLevel
                      ? 'bg-amber-500 border-amber-300 text-white ring-4 ring-amber-400/20'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {lvl}
                </div>
              </div>

              {/* Level Title Header */}
              <div className="pt-1">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>CEFR Level {lvl}</span>
                  {isCurrentLevel && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                      Current Track
                    </span>
                  )}
                </h3>
              </div>

              {/* Nodes within this level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {nodes.map((node) => {
                  const isCompleted = user.completedNodeIds.includes(node.id);
                  const crowns = user.nodeCrowns[node.id] || (isCompleted ? 1 : 0);

                  return (
                    <div
                      key={node.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {node.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Crown className="w-3 h-3 fill-amber-500" />
                            <span>{crowns}/5</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{node.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {node.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">+{node.xpReward} XP</span>
                        <button
                          onClick={() => {
                            audioSynth.playGentleFeedback();
                            onSelectNode(node);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                        >
                          <span>{isCompleted ? 'Review' : 'Start'}</span>
                          <Play className="w-3 h-3 fill-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
