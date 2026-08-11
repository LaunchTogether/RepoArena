import { parseGitHubUrl, GitHubParserError } from '../parser';
import { describe, it, expect } from 'vitest';

describe('parseGitHubUrl', () => {
  describe('Valid GitHub URLs & Formats', () => {
    it('should parse full https GitHub URL', () => {
      const result = parseGitHubUrl('https://github.com/facebook/react');
      expect(result).toEqual({
        owner: 'facebook',
        name: 'react',
        fullName: 'facebook/react',
        url: 'https://github.com/facebook/react',
      });
    });

    it('should parse full http GitHub URL', () => {
      const result = parseGitHubUrl('http://github.com/vuejs/core');
      expect(result).toEqual({
        owner: 'vuejs',
        name: 'core',
        fullName: 'vuejs/core',
        url: 'https://github.com/vuejs/core',
      });
    });

    it('should handle URL with trailing slash and .git extension', () => {
      const result = parseGitHubUrl('https://github.com/vercel/next.js.git/');
      expect(result).toEqual({
        owner: 'vercel',
        name: 'next.js',
        fullName: 'vercel/next.js',
        url: 'https://github.com/vercel/next.js',
      });
    });

    it('should parse short format owner/repository', () => {
      const result = parseGitHubUrl('tailwindlabs/tailwindcss');
      expect(result).toEqual({
        owner: 'tailwindlabs',
        name: 'tailwindcss',
        fullName: 'tailwindlabs/tailwindcss',
        url: 'https://github.com/tailwindlabs/tailwindcss',
      });
    });

    it('should parse short format with .git suffix', () => {
      const result = parseGitHubUrl('expressjs/express.git');
      expect(result).toEqual({
        owner: 'expressjs',
        name: 'express',
        fullName: 'expressjs/express',
        url: 'https://github.com/expressjs/express',
      });
    });

    it('should trim surrounding whitespace', () => {
      const result = parseGitHubUrl('  https://github.com/denoland/deno  ');
      expect(result).toEqual({
        owner: 'denoland',
        name: 'deno',
        fullName: 'denoland/deno',
        url: 'https://github.com/denoland/deno',
      });
    });
  });

  describe('Invalid GitHub URLs & Formats', () => {
    it('should throw GitHubParserError for empty string', () => {
      expect(() => parseGitHubUrl('')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('   ')).toThrow(GitHubParserError);
    });

    it('should throw GitHubParserError for non-github domain', () => {
      expect(() => parseGitHubUrl('https://gitlab.com/owner/repo')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('https://bitbucket.org/owner/repo')).toThrow(GitHubParserError);
    });

    it('should throw GitHubParserError for extra path segments', () => {
      expect(() => parseGitHubUrl('https://github.com/facebook/react/tree/main')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('facebook/react/issues/1')).toThrow(GitHubParserError);
    });

    it('should throw GitHubParserError for single segment input', () => {
      expect(() => parseGitHubUrl('facebook')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('https://github.com/facebook')).toThrow(GitHubParserError);
    });

    it('should throw GitHubParserError for query parameters', () => {
      expect(() => parseGitHubUrl('https://github.com/facebook/react?tab=readme')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('facebook/react?ref=main')).toThrow(GitHubParserError);
    });

    it('should throw GitHubParserError for hash anchors', () => {
      expect(() => parseGitHubUrl('https://github.com/facebook/react#readme')).toThrow(GitHubParserError);
      expect(() => parseGitHubUrl('facebook/react#installation')).toThrow(GitHubParserError);
    });

    it('should include correct error code INVALID_REPOSITORY_URL and input in error object', () => {
      try {
        parseGitHubUrl('invalid-input');
      } catch (err) {
        expect(err).toBeInstanceOf(GitHubParserError);
        const parserErr = err as GitHubParserError;
        expect(parserErr.code).toBe('INVALID_REPOSITORY_URL');
        expect(parserErr.input).toBe('invalid-input');
      }
    });
  });
});
