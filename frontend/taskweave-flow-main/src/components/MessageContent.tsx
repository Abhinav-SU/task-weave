import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className = '' }: MessageContentProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-secondary/50 px-1 py-0.5 rounded text-xs font-mono`} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div className="my-2">{children}</div>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="ml-2">{children}</li>;
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-primary/50 pl-4 my-2 italic">{children}</blockquote>;
          },
          a({ href, children }) {
            return (
              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          table({ children }) {
            return <table className="border-collapse border border-border my-2">{children}</table>;
          },
          th({ children }) {
            return <th className="border border-border px-2 py-1 bg-secondary/50 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-border px-2 py-1">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
