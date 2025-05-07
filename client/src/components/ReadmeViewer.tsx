import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography } from '@mui/material';
import type { CodeProps } from 'react-markdown/lib/ast-to-react';

interface ReadmeViewerProps {
    content: string;
}

const ReadmeViewer: React.FC<ReadmeViewerProps> = ({ content }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                README
            </Typography>
            <Box
                sx={{
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
                    {content}
                </ReactMarkdown>
            </Box>
        </Box>
    );
};

export default ReadmeViewer; 