import React from 'react';

/**
 * 工作流程步骤接口
 */
export interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  disabled?: boolean;
  action?: () => void;
}

/**
 * 工作流程时间线组件
 * 横向展示5个步骤，带连接线和进度指示器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep: number;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ steps }) => {
  const getStepClasses = (step: WorkflowStep) => {
    const baseClasses =
      'flex flex-col items-center p-6 rounded-lg shadow-md transition-all duration-300 cursor-pointer';

    if (step.disabled) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed opacity-60`;
    }

    switch (step.status) {
      case 'completed':
        return `${baseClasses} bg-green-50 border-2 border-green-200 hover:shadow-lg hover:bg-green-100`;
      case 'active':
        return `${baseClasses} bg-blue-50 border-2 border-blue-600 hover:shadow-lg hover:bg-blue-100 animate-pulse`;
      default:
        return `${baseClasses} bg-white border-2 border-gray-200 hover:shadow-lg hover:bg-gray-50`;
    }
  };

  const getStepIconClasses = (step: WorkflowStep) => {
    const baseClasses =
      'w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-3';

    if (step.disabled) {
      return `${baseClasses} bg-gray-200 text-gray-400`;
    }

    switch (step.status) {
      case 'completed':
        return `${baseClasses} bg-green-600 text-white`;
      case 'active':
        return `${baseClasses} bg-blue-600 text-white`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-600`;
    }
  };

  const getArrowClasses = (step: WorkflowStep, nextStep: WorkflowStep) => {
    const baseClasses = 'flex items-center justify-center text-2xl font-bold';

    if (step.disabled || nextStep.disabled) {
      return `${baseClasses} text-gray-300`;
    }

    if (step.status === 'completed') {
      return `${baseClasses} text-green-500`;
    }

    return `${baseClasses} text-gray-400`;
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (step.disabled || !step.action) return;
    step.action();
  };

  return (
    <div className='w-full'>
      {/* 桌面端横向布局 */}
      <div className='hidden md:flex items-center justify-center w-full gap-4'>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* 步骤卡片 */}
            <div
              className={`w-64 ${getStepClasses(step)}`}
              onClick={() => handleStepClick(step)}
              title={step.disabled ? '此步骤暂时不可用' : step.description}
            >
              {/* 步骤图标 */}
              <div className={getStepIconClasses(step)}>
                {step.status === 'completed' ? '✓' : step.icon}
              </div>

              {/* 步骤标题 */}
              <h3
                className={`text-lg font-semibold mb-2 ${
                  step.disabled
                    ? 'text-gray-400'
                    : step.status === 'completed'
                      ? 'text-green-800'
                      : step.status === 'active'
                        ? 'text-blue-800'
                        : 'text-gray-800'
                }`}
              >
                {step.label}
              </h3>

              {/* 步骤描述 */}
              <p
                className={`text-sm text-center ${
                  step.disabled
                    ? 'text-gray-400'
                    : step.status === 'completed'
                      ? 'text-green-600'
                      : step.status === 'active'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                }`}
              >
                {step.description}
              </p>
            </div>

            {/* 连接箭头 */}
            {index < steps.length - 1 && (
              <div
                className={`flex-shrink-0 ${getArrowClasses(step, steps[index + 1])}`}
              >
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 移动端纵向布局 */}
      <div className='md:hidden space-y-4'>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* 步骤卡片 */}
            <div
              className={`w-full ${getStepClasses(step)}`}
              onClick={() => handleStepClick(step)}
              title={step.disabled ? '此步骤暂时不可用' : step.description}
            >
              <div className='flex items-center space-x-4'>
                {/* 步骤图标 */}
                <div className={getStepIconClasses(step)}>
                  {step.status === 'completed' ? '✓' : step.icon}
                </div>

                {/* 步骤内容 */}
                <div className='flex-1'>
                  <h3
                    className={`text-lg font-semibold mb-1 ${
                      step.disabled
                        ? 'text-gray-400'
                        : step.status === 'completed'
                          ? 'text-green-800'
                          : step.status === 'active'
                            ? 'text-blue-800'
                            : 'text-gray-800'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`text-sm ${
                      step.disabled
                        ? 'text-gray-400'
                        : step.status === 'completed'
                          ? 'text-green-600'
                          : step.status === 'active'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 连接箭头 */}
            {index < steps.length - 1 && (
              <div
                className={`flex justify-center ${getArrowClasses(step, steps[index + 1])}`}
              >
                ↓
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
