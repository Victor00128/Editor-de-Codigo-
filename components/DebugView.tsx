import React, { useState, useCallback } from 'react';
import { Theme } from '../types';
import { DebugIcon, PlayIcon, PauseIcon, StopIcon, StepOverIcon, StepIntoIcon, StepOutIcon, RestartIcon, ConsoleIcon, BreakpointIcon } from './icons';

interface DebugViewProps {
    theme: Theme;
}

interface Breakpoint {
    id: string;
    line: number;
    file: string;
    enabled: boolean;
    condition?: string;
}

interface DebugSession {
    id: string;
    status: 'stopped' | 'running' | 'paused' | 'terminated';
    currentLine?: number;
    currentFile?: string;
    callStack: any[];
    variables: any[];
    breakpoints: Breakpoint[];
}

const DebugView: React.FC<DebugViewProps> = ({ theme }) => {
    const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
    const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<string>('node');
    const [isRunning, setIsRunning] = useState(false);

    const debugConfigs = [
        { id: 'node', name: 'Node.js', description: 'Debug Node.js applications' },
        { id: 'chrome', name: 'Chrome', description: 'Debug web applications in Chrome' },
        { id: 'firefox', name: 'Firefox', description: 'Debug web applications in Firefox' },
        { id: 'edge', name: 'Edge', description: 'Debug web applications in Edge' },
    ];

    const handleStartDebug = useCallback(() => {
        if (isRunning) return;
        
        setIsRunning(true);
        const session: DebugSession = {
            id: Date.now().toString(),
            status: 'running',
            currentLine: 1,
            currentFile: 'main.js',
            callStack: [
                { name: 'main', line: 1, file: 'main.js' },
                { name: 'startup', line: 5, file: 'startup.js' }
            ],
            variables: [
                { name: 'count', value: '0', type: 'number' },
                { name: 'message', value: '"Hello World"', type: 'string' },
                { name: 'isActive', value: 'true', type: 'boolean' }
            ],
            breakpoints: breakpoints.filter(bp => bp.enabled),
        };
        
        setDebugSession(session);
        setConsoleOutput(prev => [...prev, 'Debug session started', 'Breakpoint hit at main.js:1']);
        
        // Simulate debug session
        setTimeout(() => {
            setDebugSession(prev => prev ? { ...prev, status: 'paused', currentLine: 5 } : null);
            setConsoleOutput(prev => [...prev, 'Paused at breakpoint']);
        }, 2000);
    }, [isRunning, breakpoints]);

    const handlePause = useCallback(() => {
        if (!debugSession || debugSession.status !== 'running') return;
        
        setDebugSession(prev => prev ? { ...prev, status: 'paused' } : null);
        setConsoleOutput(prev => [...prev, 'Debug session paused']);
    }, [debugSession]);

    const handleStop = useCallback(() => {
        setIsRunning(false);
        setDebugSession(null);
        setConsoleOutput(prev => [...prev, 'Debug session terminated']);
    }, []);

    const handleStepOver = useCallback(() => {
        if (!debugSession || debugSession.status !== 'paused') return;
        
        const newLine = (debugSession.currentLine || 1) + 1;
        setDebugSession(prev => prev ? { ...prev, currentLine: newLine } : null);
        setConsoleOutput(prev => [...prev, `Stepped over to line ${newLine}`]);
    }, [debugSession]);

    const handleStepInto = useCallback(() => {
        if (!debugSession || debugSession.status !== 'paused') return;
        
        setConsoleOutput(prev => [...prev, 'Stepped into function']);
        // In a real debugger, this would step into function calls
    }, [debugSession]);

    const handleStepOut = useCallback(() => {
        if (!debugSession || debugSession.status !== 'paused') return;
        
        setConsoleOutput(prev => [...prev, 'Stepped out of function']);
        // In a real debugger, this would step out of the current function
    }, [debugSession]);

    const handleRestart = useCallback(() => {
        handleStop();
        setTimeout(() => handleStartDebug(), 100);
    }, [handleStop, handleStartDebug]);

    const addBreakpoint = useCallback((line: number, file: string) => {
        const newBreakpoint: Breakpoint = {
            id: Date.now().toString(),
            line,
            file,
            enabled: true,
        };
        setBreakpoints(prev => [...prev, newBreakpoint]);
    }, []);

    const toggleBreakpoint = useCallback((breakpointId: string) => {
        setBreakpoints(prev => prev.map(bp => 
            bp.id === breakpointId ? { ...bp, enabled: !bp.enabled } : bp
        ));
    }, []);

    const removeBreakpoint = useCallback((breakpointId: string) => {
        setBreakpoints(prev => prev.filter(bp => bp.id !== breakpointId));
    }, []);

    const clearConsole = useCallback(() => {
        setConsoleOutput([]);
    }, []);

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <DebugIcon className="w-5 h-5 text-dark-text-alt" />
                    <h2 className="text-lg font-semibold text-dark-text dark:text-dark-text">Run and Debug</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={selectedConfig}
                        onChange={(e) => setSelectedConfig(e.target.value)}
                        className="px-3 py-1 bg-light-bg dark:bg-dark-bg border border-dark-accent/30 rounded text-dark-text dark:text-dark-text text-sm focus:outline-none"
                    >
                        {debugConfigs.map(config => (
                            <option key={config.id} value={config.id}>
                                {config.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Debug Controls */}
            <div className="flex items-center space-x-2 p-3 bg-light-bg-alt dark:bg-dark-bg-alt rounded-md">
                <button
                    onClick={handleStartDebug}
                    disabled={isRunning}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                >
                    <PlayIcon className="w-4 h-4" />
                    <span>Start</span>
                </button>
                
                <button
                    onClick={handlePause}
                    disabled={!debugSession || debugSession.status !== 'running'}
                    className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                >
                    <PauseIcon className="w-4 h-4" />
                    <span>Pause</span>
                </button>
                
                <button
                    onClick={handleStop}
                    disabled={!debugSession}
                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                >
                    <StopIcon className="w-4 h-4" />
                    <span>Stop</span>
                </button>
                
                <div className="w-px h-6 bg-dark-accent/30 mx-2" />
                
                <button
                    onClick={handleStepOver}
                    disabled={!debugSession || debugSession.status !== 'paused'}
                    className="flex items-center space-x-2 px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 disabled:bg-dark-accent/10 disabled:cursor-not-allowed rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    title="Step Over (F10)"
                >
                    <StepOverIcon className="w-4 h-4" />
                    <span>Step Over</span>
                </button>
                
                <button
                    onClick={handleStepInto}
                    disabled={!debugSession || debugSession.status !== 'paused'}
                    className="flex items-center space-x-2 px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 disabled:bg-dark-accent/10 disabled:cursor-not-allowed rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    title="Step Into (F11)"
                >
                    <StepIntoIcon className="w-4 h-4" />
                    <span>Step Into</span>
                </button>
                
                <button
                    onClick={handleStepOut}
                    disabled={!debugSession || debugSession.status !== 'paused'}
                    className="flex items-center space-x-2 px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 disabled:bg-dark-accent/10 disabled:cursor-not-allowed rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    title="Step Out (Shift+F11)"
                >
                    <StepOutIcon className="w-4 h-4" />
                    <span>Step Out</span>
                </button>
                
                <button
                    onClick={handleRestart}
                    disabled={!debugSession}
                    className="flex items-center space-x-2 px-3 py-1 bg-dark-accent/20 hover:bg-dark-accent/30 disabled:bg-dark-accent/10 disabled:cursor-not-allowed rounded text-dark-text dark:text-dark-text text-sm transition-colors"
                    title="Restart (Ctrl+Shift+F5)"
                >
                    <RestartIcon className="w-4 h-4" />
                    <span>Restart</span>
                </button>
            </div>

            {/* Debug Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                {/* Variables */}
                <div className="bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 p-3">
                    <h3 className="font-medium text-dark-text dark:text-dark-text mb-3">Variables</h3>
                    <div className="space-y-2">
                        {debugSession?.variables.map((variable, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-dark-text dark:text-dark-text">{variable.name}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-dark-text-alt">{variable.value}</span>
                                    <span className="text-xs text-dark-text-alt bg-dark-accent/20 px-2 py-1 rounded">
                                        {variable.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!debugSession && (
                            <div className="text-dark-text-alt text-sm">No debug session active</div>
                        )}
                    </div>
                </div>

                {/* Call Stack */}
                <div className="bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 p-3">
                    <h3 className="font-medium text-dark-text dark:text-dark-text mb-3">Call Stack</h3>
                    <div className="space-y-2">
                        {debugSession?.callStack.map((frame, index) => (
                            <div key={index} className="text-sm">
                                <div className="text-dark-text dark:text-dark-text">{frame.name}</div>
                                <div className="text-dark-text-alt text-xs">{frame.file}:{frame.line}</div>
                            </div>
                        ))}
                        {!debugSession && (
                            <div className="text-dark-text-alt text-sm">No debug session active</div>
                        )}
                    </div>
                </div>

                {/* Breakpoints */}
                <div className="bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 p-3">
                    <h3 className="font-medium text-dark-text dark:text-dark-text mb-3">Breakpoints</h3>
                    <div className="space-y-2">
                        {breakpoints.map((breakpoint) => (
                            <div key={breakpoint.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <BreakpointIcon className={`w-4 h-4 ${breakpoint.enabled ? 'text-red-500' : 'text-gray-400'}`} />
                                    <span className="text-dark-text dark:text-dark-text">{breakpoint.file}:{breakpoint.line}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => toggleBreakpoint(breakpoint.id)}
                                        className="p-1 hover:bg-dark-accent/20 rounded"
                                        title={breakpoint.enabled ? 'Disable' : 'Enable'}
                                    >
                                        {breakpoint.enabled ? '●' : '○'}
                                    </button>
                                    <button
                                        onClick={() => removeBreakpoint(breakpoint.id)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-500"
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                        {breakpoints.length === 0 && (
                            <div className="text-dark-text-alt text-sm">No breakpoints set</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Console Output */}
            <div className="bg-light-bg-alt dark:bg-dark-bg-alt rounded-md border border-dark-accent/20 p-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-dark-text dark:text-dark-text flex items-center space-x-2">
                        <ConsoleIcon className="w-4 h-4" />
                        <span>Debug Console</span>
                    </h3>
                    <button
                        onClick={clearConsole}
                        className="text-xs text-dark-text-alt hover:text-dark-text dark:hover:text-dark-text transition-colors"
                    >
                        Clear
                    </button>
                </div>
                <div className="bg-light-bg dark:bg-dark-bg rounded p-2 h-32 overflow-y-auto font-mono text-sm">
                    {consoleOutput.map((line, index) => (
                        <div key={index} className="text-dark-text dark:text-dark-text">
                            {line}
                        </div>
                    ))}
                    {consoleOutput.length === 0 && (
                        <div className="text-dark-text-alt">No output yet</div>
                    )}
                </div>
            </div>

            {/* Status */}
            {debugSession && (
                <div className="text-sm text-dark-text-alt">
                    Status: <span className="text-dark-text dark:text-dark-text">{debugSession.status}</span>
                    {debugSession.currentFile && (
                        <> • File: <span className="text-dark-text dark:text-dark-text">{debugSession.currentFile}</span></>
                    )}
                    {debugSession.currentLine && (
                        <> • Line: <span className="text-dark-text dark:text-dark-text">{debugSession.currentLine}</span></>
                    )}
                </div>
            )}
        </div>
    );
};

export default DebugView;



