import './index.scss';

import { useEffect, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, ORIGIN, STATUS, CallBackProps, Step, Placement } from 'react-joyride';

import { usePlaygroundContext } from "../PlaygroundContext";

const primaryColor = '#007bff';
const labels = {
    last: 'Done',
}


const topCardConfig = {
    placement: 'bottom' as Placement,
    floaterProps: {
        styles: {
            floater: {
                marginTop: '-200px',
            }
        }
    }
};
const bottomCardConfig = {
    placement: 'top' as Placement,
    floaterProps: {
        styles: {
            floater: {
                marginBottom: '-200px'
            }
        }
    }
};

const keyboardHint = '(Use ← → arrow keys to navigate steps)';

/**
  data :{
    performClick: true,
    otherClickTarget: '.react-joyride__overlay', //else target is considered as clickable
    title: 'Query History',
    footer:''
  }
 */
let steps: Step[] = [
    {
        target: '.select-query-label',
        content: 'Select a sample query from the popup',
        disableBeacon: true, //direct step open instead of beacon (dot)
        data: {
            //custom props
            performClick: true,
            title: 'Select query',
            footer: keyboardHint
        }
    },
    {
        target: '.query-item:nth-child(1)',
        content: 'Click on any query to load it',
        data: {
            performClick: true,
            title: 'Select query'
        }
    },
    {
        target: '.pg-query-card',
        content: 'View and edit your Redis query here',
        ...topCardConfig,
        data: {
            title: 'Query editor'
        }
    },
    {
        target: '.pg-db-index-card',
        content: 'View the corresponding index for your Redis query',
        ...topCardConfig,
        data: {
            title: 'DB Index view'
        }
    },
    {
        target: '.pg-data-source-card',
        content: 'View the sample source data used by your Redis query',
        ...bottomCardConfig,
        data: {
            title: 'Data source view'
        }
    },
    {
        target: '.header-run-btn',
        content: 'Execute your Redis query',
        data: {
            performClick: true,
            title: 'Run'
        }
    },
    {
        target: '.pg-result-card',
        content: 'View the query results here',
        ...bottomCardConfig,
        data: {
            title: 'Results view'
        }
    },
    {
        target: '.header-share-btn',
        content: 'Share your Redis query using a generated URL',
        data: {
            title: 'Share'
        }
    },
    {
        target: '.header-reset-btn',
        content: 'Reset your modified Redis query back to its default state',
        data: {
            title: 'Reset'
        }
    },
    {
        target: '.pg-query-category .pg-list-item:last-child',
        content: 'Click on other related queries in the category to view them',
        data: {
            title: 'Related queries'
        }
    },
    {
        target: '.pg-query-card .pg-query-history-icon img',
        content: 'Click on the query history icon to view your query history',
        data: {
            performClick: true,
            title: 'Query History'
        }
    },
    {
        target: '.history-list-container',
        content: 'Click on any query in the history to load it',
        data: {
            title: 'Query History'
        }
    },
    {
        target: '.history-header .pg-query-history-delete-icon',
        content: 'Click on delete icon to clear the entire query history',
        data: {
            performClick: true,
            otherClickTarget: '.ReactModal__Overlay--after-open',
            title: 'Query History'
        }
    },
    {
        target: '.pg-replay-tour-lbl',
        content: 'Replay this tour anytime to review the steps',
        data: {
            title: 'Replay tour'
        }
    },

];

const CustomTooltip = ({ title, content, footer, index, total }: { title: string, content: string, footer?: string, index: number, total: number }) => (
    <div className='pg-joyride-tooltip'>
        <div className='pg-joyride-header'>
            <span className='pg-joyride-title font-medium'>{title}</span>

            <span className='pg-joyride-step-count'>(Step {index} of {total})</span>

        </div>
        <div className='pg-joyride-content'>
            {content}
        </div>
        <div className='pg-joyride-footer'>
            {footer}
        </div>
    </div>
);

steps = steps.map((step, index) => ({
    ...step,
    content: (
        <CustomTooltip
            title={step.data?.title || ''}
            content={step.content as string}
            footer={step.data?.footer || ""}
            index={index + 1}
            total={steps.length}
        />
    )
}));

const PgWalkthrough = () => {

    const { runTour, setRunTour, fnSetTourCompleted } = usePlaygroundContext();
    const [stepIndex, setStepIndex] = useState(0);

    const endTour = () => {
        setRunTour(false);
        fnSetTourCompleted(true);
        setStepIndex(0);
    }

    const handleJoyrideCallback = (data: CallBackProps) => {
        //https://github.com/gilbarbara/react-joyride/blob/main/docs/callback.md

        const { action, index, origin, status, type, step, lifecycle } = data;

        // console.debug(`Step ${index + 1} - Type: ${type}, Lifecycle: ${lifecycle}`);

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === "close") {
            endTour();
            return;
        }

        const targetElement = document.querySelector(step.target as string);

        //on next 
        if (type === EVENTS.STEP_AFTER) {

            if (step.data?.performClick) {
                if (step.data?.otherClickTarget) {
                    const otherClickTarget = document.querySelector(step.data?.otherClickTarget as string);
                    if (otherClickTarget && otherClickTarget instanceof HTMLElement) {
                        otherClickTarget.click();
                    }
                }
                else if (targetElement && targetElement instanceof HTMLElement) {
                    targetElement.click();
                }
                setRunTour(false); //React modal popup issue : Force reposition by temporarily stopping and restarting the tour
                setTimeout(() => {
                    setRunTour(true);
                    setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
                }, 500); //setTimeout for any UI transitions
            }
            else {
                setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
            }
        }
    };



    useEffect(() => {

        // Add keyboard navigation
        const handleKeyPress = (event: KeyboardEvent) => {

            if (runTour) {
                switch (event.key) {
                    case 'ArrowLeft':
                        setStepIndex(prevIndex => Math.max(0, prevIndex - 1));

                        break;
                    case 'ArrowRight':
                        setStepIndex(prevIndex => Math.min(steps.length - 1, prevIndex + 1));

                        break;
                    case 'Escape':
                        endTour();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [runTour]);

    return (
        <Joyride
            steps={steps}
            run={runTour}
            continuous={true}
            showProgress={false}
            showSkipButton={true}
            stepIndex={stepIndex}
            callback={handleJoyrideCallback}
            //disableScrolling={true}
            styles={{
                options: {
                    // arrowColor: '#e3ffeb',
                    // backgroundColor: '#e3ffeb',
                    // overlayColor: 'rgba(79, 26, 0, 0.4)',
                    // textColor: '#004a14',

                    primaryColor: primaryColor,
                    zIndex: 10000,
                },
            }}


            locale={{
                last: labels.last,
            }}
        />
    )
}

export default PgWalkthrough;