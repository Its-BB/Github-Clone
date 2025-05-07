import React, { useState } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CodeProps } from 'react-markdown/lib/ast-to-react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = 'Write your content here...',
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Write" />
                <Tab label="Preview" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
                {activeTab === 0 ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            resize: 'vertical',
                        }}
                    />
                ) : (
                    <Paper
                        sx={{
                            p: 2,
                            minHeight: '200px',
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                            },
                            '& table': {
                                borderCollapse: 'collapse',
                                width: '100%',
                                marginBottom: 2,
                            },
                            '& th, & td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                padding: 1,
                            },
                            '& blockquote': {
                                borderLeft: 4,
                                borderLeftStyle: 'solid',
                                borderLeftColor: 'grey.300',
                                margin: 0,
                                paddingLeft: 2,
                                color: 'text.secondary',
                            },
                            '& pre': {
                                backgroundColor: '#1e1e1e',
                                color: '#d4d4d4',
                                padding: '1em',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                overflow: 'auto',
                            },
                            '& code': {
                                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                fontSize: '14px',
                            },
                        }}
                    >
                        {value ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: CodeProps) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <pre className={className} {...props}>
                                                <code className={className} {...props}>
                                                    {String(children).replace(/\n$/, '')}
                                                </code>
                                            </pre>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <Typography color="textSecondary">
                                Nothing to preview
                            </Typography>
                        )}
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default MarkdownEditor; 