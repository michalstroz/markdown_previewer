
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.querySelector('#editor');
    const preview = document.querySelector('#preview');
    const replacer = new Replacer(preview);

    replacer.setElementsInPrev(editor.value);
    replacer.handleTypingInEditor(editor);
});

class Replacer {
    constructor(preview, options = {
        blockPatterns: {
            heading1: /^#.+$/,
            heading2: /^#{2}.+$/,
            heading3: /^#{3}.+$/,
            blockQuote: /^>.*$/,
            img: /!\[.*]\(.*\)/,
            multilineCode: /`{3}\n+[\s\S]+?\n+`{3}/,
            orderedList: /(\s*(1\.)\s+.+)(\s*(1\.|-|\*)\s+.+)+/,
            unorderedList: /^(\s*-\s+.+\s*)+$/,
            table: /((.+)(\|.+)+)\n(([-\s]+)(\|[-\s]+)+)(\n(.+)(\|.+)+)+/,
        },
        divideTextPatterns: {
            multilineCode: [/^`{3}$/, /`{3}/],
            orderedList: [/^\s*1\.\s+.+$/, /^(\s*(1\.|\*|-)\s+.+|\n)$/],
            unorderedList: [/^\s*-\s+.+$/, /^(\s*-\s+.+|\n)$/],
            table: [/^(\s*([-\s]+)(\|[-\s]+)+|\n)$/, /^(\s*(.+)(\|.+)+|\n)$/]
        },
        classNames: {
            h1: 'previewerMainHeading',
            h2: 'previewerSecondHeading',
            h3: 'previewerThirdHeading',
            blockquote: 'previewerBlockQuote',
            img: 'previewerImage',
            pre: 'previewerMultiLineCode',
            ol: 'previewerOrderedList',
            ul: 'previewerUnorderedList',
            table: 'previewerTable',
            p: 'previewerParagraph',
            code: 'previewerInlineCode',
            b: 'previewerBoldText',
            i: 'previewerItalicText',
            del: 'previewerStrikethroughText',
            a: 'previewerLink'
        }
    }) {
        this.preview = preview;
        this.options = options;
    }

    handleTypingInEditor(input) {
        input.addEventListener('input', (e) => this.setElementsInPrev(e.target.value));
    }

    divideTextToBlockElements(text) {
        const array = text.split(/\n+/g);
        let i = 0;
        this.arr = [];
        const patternsArr = Object.values(this.options.divideTextPatterns);

        while (i < array.length) {
            const pattern = patternsArr.find((element) => element[0].test(array[i]));

            if (pattern) {
                i = this.addBlockToArr(array, i, pattern[1]);
            } else {
                this.arr.push(array[i]);
                i++;
            }
        }
    }

    addBlockToArr(arr, idx, loopArg) {
        const subArr = [arr[idx]];
        let j = idx + 1;

        if (subArr[0].trim() === '```') {
            const lastIndex = arr.indexOf('```', idx + 1);
            while (j <= lastIndex) {
                subArr.push(arr[j]);
                j++
            }
            this.arr.push(subArr.join('\n'));
        } else if (this.options.divideTextPatterns.table[0].test(arr[idx])) {
            while (loopArg.test(arr[j])) {
                subArr.push(arr[j]);
                j++;
            }

            if (this.options.divideTextPatterns.table[1].test(this.arr[this.arr.length - 1])) {
                let str = this.arr[this.arr.length - 1];
                str += '\n' + subArr.join('\n');
                this.arr[this.arr.length - 1] = str;
            } else {
                this.arr.push(subArr.join('\n'));
            }
        } else if (this.options.divideTextPatterns.orderedList[1].test(arr[idx]) || this.options.divideTextPatterns.unorderedList[1].test(arr[idx])) {
            while (loopArg.test(arr[j])) {
                subArr.push(arr[j]);
                j++;
            }
            this.arr.push(subArr.join('\n'));
        }
        return j;
    };

    setElementsInPrev(text) {

        while (this.preview.firstChild) {
            this.preview.firstChild.remove();
        }

        this.divideTextToBlockElements(text);
        for (let i = 0; i < this.arr.length; i++) {
            if (this.options.blockPatterns.heading3.test(this.arr[i])) {
                this.createBlockTxtElement(i, 'h3');
            } else if (this.options.blockPatterns.heading2.test(this.arr[i])) {
                this.createBlockTxtElement(i, 'h2');
            } else if (this.options.blockPatterns.heading1.test(this.arr[i])) {
                this.createBlockTxtElement(i, 'h1');
            } else if (this.options.blockPatterns.blockQuote.test(this.arr[i])) {
                this.createBlockTxtElement(i, 'blockquote');
            } else if (this.options.blockPatterns.img.test(this.arr[i])) {
                this.setImgElement(i);
            } else if (this.options.blockPatterns.multilineCode.test(this.arr[i])) {
                this.setBlockCode(i);
            } else if (this.options.blockPatterns.orderedList.test(this.arr[i])) {
                this.setOrderedList(i);
            } else if (this.options.blockPatterns.unorderedList.test(this.arr[i])) {
                this.setUnorderedList(i);
            } else if (this.options.blockPatterns.table.test(this.arr[i])) {
                this.setTable(i);
            } else {
                this.createBlockTxtElement(i, 'p');
            }
        }
    };

    createBlockTxtElement(idx, tag) {
        const element = document.createElement(tag);
        let str = this.arr[idx];

        if (tag === 'h1') {
            str = str.slice(1).trim();
        } else if (tag === 'h2') {
            str = str.slice(2).trim();
        } else if (tag === 'h3') {
            str = str.slice(3).trim();
        } else if (tag === 'blockquote') {
            str = str.slice(1).trim();
        }

        const content = document.createTextNode(str);
        element.className = this.options.classNames[tag];
        element.id = 'previewerBlockElement-' + idx;
        element.appendChild(content);
        this.setInlineElement(element);
        this.preview.appendChild(element);
    };

    setImgElement(idx) {
        const str = this.arr[idx];
        const src = str.slice(str.indexOf('(') + 1, str.indexOf(')')).trim();
        const alt = str.slice(str.indexOf('[') + 1, str.indexOf(']')).trim();

        const div = document.createElement('div');
        div.className = 'previewerImageWrapper';
        div.id = 'previewerBlockElement-' + idx;

        const img = document.createElement('img');
        img.className = this.options.classNames['img'];
        img.src = src;
        img.alt = alt;

        div.appendChild(img);
        this.preview.appendChild(div);
    };

    setBlockCode(idx) {
        let str = this.arr[idx];
        str = str.slice(3, str.length - 3).trim();
        const content = document.createTextNode(str);
        const code = document.createElement('code');
        code.appendChild(content);

        const pre = document.createElement('pre');
        pre.className = this.options.classNames['pre'];
        pre.id = 'previewerBlockElement-' +  idx;
        pre.appendChild(code);
        this.preview.appendChild(pre);
    };

    setOrderedList(idx) {
        let str = this.arr[idx];
        const listArr = str.split('\n').filter(v => v.trim() !== '');
        const orderedList = document.createElement('ol');
        orderedList.className = this.options.classNames['ol'];
        orderedList.id = 'previewerBlockElement-' + idx;

        listArr.forEach((v) => {
            const li = document.createElement('li');
            const txt = v.match(/^(\S+)\s(.+)/)[2].trim();
            const content = document.createTextNode(txt);
            li.appendChild(content);
            this.setInlineElement(li);
            orderedList.appendChild(li);
        });

        this.preview.appendChild(orderedList);
    };

    setUnorderedList(idx) {
        let strArr = this.arr[idx].split('\n').filter(v => v.trim() !== '');
        let i = 0;
        const self = this;

        (function createList(depth, parent = self.preview) {
            while (i < strArr.length) {
                const [whiteSigns, data] = strArr[i].split('- ');
                const whiteSignsLength = whiteSigns.length;

                if (whiteSignsLength < depth) {
                    break;
                } else if (whiteSignsLength === depth) {
                    if (parent.localName === 'li') {
                        parent = parent.parentElement;
                    }

                    const li = document.createElement('li');
                    const content = document.createTextNode(data);
                    li.appendChild(content);
                    self.setInlineElement(li);
                    parent.appendChild(li);
                    i++;
                } else {
                    if (parent !== self.preview) {
                        parent = parent.lastChild;
                    }

                    const ul = document.createElement('ul');
                    ul.className = self.options['ul'];
                    createList(whiteSignsLength, ul);
                    parent.appendChild(ul);
                }
            }
        })(-1);
    };

    setTable(idx) {
        const arr = this.arr[idx].split('\n');
        const table = document.createElement('table');
        table.className = this.options.classNames['table'];
        table.id = 'previewerBlockElement-' + idx;

        for (let i = 0; i < arr.length; i++) {
            const tableRow = document.createElement('tr');
            if (i === 1) {
                continue;
            } else if (i === 0) {
                arr[i].split('|').forEach((v) => {
                    const th = document.createElement('th');
                    const content = document.createTextNode(v.trim());
                    th.appendChild(content);
                    this.setInlineElement(th);
                    tableRow.appendChild(th);
                });
            } else {
                arr[i].split('|').forEach((v) => {
                    const td = document.createElement('td');
                    const content = document.createTextNode(v.trim());
                    td.appendChild(content);
                    tableRow.appendChild(td);
                });
            }
            table.appendChild(tableRow);
        }
        this.preview.appendChild(table);
    };

    setInlineElement(element) {
        let txt = element.innerHTML;

        txt = txt.replace(/`.+`/g, (match) => {
            const str = match.slice(1, match.length - 1).trim();
            const signIndex = str.indexOf('`');
            if (signIndex === -1) {
                return `<code class="inlineCode">${str}</code>`;
            } else {
                return match;
            }
        });

        txt = txt.replace(/\*\*.+\*\*/g, (match) => {
            const str = match.slice(2, match.length - 2).trim();
            return `<b class="boldText">${str}</b>`;
        });

        txt = txt.replace(/_.+_/g, (match) => {
            const str = match.slice(1, match.length - 1).trim();
            return `<i class="italicText">${str}</i>`;
        });

        txt = txt.replace(/~~.+~~/g, (match) => {
            const str = match.slice(2, match.length - 2).trim();
            return `<del class="crossedLine">${str}</del>`
        });

        txt = txt.replace(/\[.+]\(.*\)/g, (match) => {
            const href = match.slice(match.indexOf('(') + 1, match.indexOf(')')).trim();
            const val = match.slice(match.indexOf('[') + 1, match.indexOf(']')).trim();
            return `<a class="link" target="_blank" href="${href}">${val}</a>`;
        });

        element.innerHTML = txt;
    }

}



