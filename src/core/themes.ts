import {createTheme} from 'thememirror';
import {tags as t} from '@lezer/highlight';

export const nqThemeDark = createTheme({
	variant: 'dark',
	settings: {
		background: '#222',
		foreground: '#f1f1f1',
		caret: '#f1f1f1',
		selection: '#70b4f8',
		lineHighlight: '#8a91991a',
		gutterBackground: '#2c2c2c',
		gutterForeground: '#f1f1f1',
	},
	styles: [
		{
			tag: t.comment,
			color: '#447b0c',
		},
		{
			tag: t.variableName,
			color: '#99c1f1',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#5c9820',
		},
		{
			tag: t.number,
			color: '#f9f06b',
		},
		{
			tag: t.bool,
			color: '#ffa348',
		},
		{
			tag: t.null,
			color: '#f66151',
		},
		{
			tag: t.keyword,
			color: '#f66151',
		},
		{
			tag: t.operator,
			color: '#f1f1f1',
		},
		{
			tag: t.className,
			color: '#e5a50a',
		},
		{
			tag: t.definition(t.typeName),
			color: '#3584e4',
		},
		{
			tag: t.typeName,
			color: '#dc8add',
		},
		{
			tag: t.angleBracket,
			color: '#f1f1f1',
		},
		{
			tag: t.tagName,
			color: '#f6d32d',
		},
		{
			tag: t.attributeName,
			color: '#ffa348',
		},
	],
});

export const nqThemeLight = createTheme({
	variant: 'light',
	settings: {
		background: '#f1f1f1',
		foreground: '#1c1c1c',
		caret: '#1c1c1c',
		selection: '#70b4f8',
		lineHighlight: '#deddda',
		gutterBackground: '#c5c5c5',
		gutterForeground: '#1c1c1c',
	},
	styles: [
		{
			tag: t.comment,
			color: '#447b0c',
		},
		{
			tag: t.variableName,
			color: '#1c71d8',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#5c9820',
		},
		{
			tag: t.number,
			color: '#e5a50a',
		},
		{
			tag: t.bool,
			color: '#ffa348',
		},
		{
			tag: t.null,
			color: '#c01c28',
		},
		{
			tag: t.keyword,
			color: '#c01c28',
		},
		{
			tag: t.operator,
			color: '#2c2c2c',
		},
		{
			tag: t.className,
			color: '#f59f1e',
		},
		{
			tag: t.definition(t.typeName),
			color: '#3584e4',
		},
		{
			tag: t.typeName,
			color: '#9141ac',
		},
		{
			tag: t.angleBracket,
			color: '#1c1c1c',
		},
		{
			tag: t.tagName,
			color: '#e5a50a',
		},
		{
			tag: t.attributeName,
			color: '#c64600',
		},
	],
});