import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import styles from './TimelineView.module.css';

const TimelineView = ({ kanbanTasks }) => {
  return (
    <div className={styles.wbsTimeline}>
      <div className={styles.timelineNote}>
        <InformationCircleIcon className="w-5 h-5 text-blue-500" />
        Timeline view shows project phases and dependencies in chronological order
      </div>
      {kanbanTasks.map((task, index) => (
        <div key={task.id} className={styles.timelinePhase}>
          <div className={styles.phaseHeader}>
            <div className={styles.phaseNumber}>{index + 1}</div>
            <div className={styles.phaseInfo}>
              <h4 className={styles.phaseTitle}>{task.title}</h4>
              <p className={styles.phaseDuration}>{task.estimatedHours}h - {task.phase}</p>
            </div>
            <div className={styles.phaseProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className={styles.progressText}>{task.progress}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;