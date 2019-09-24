const placeHolder = `# Welcome to my Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:
  
Heres some code, \`<div></div>\`, between 2 backticks.


\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine == '\`\`\`' && lastLine == '\`\`\`') {
    return multiLineCode;
  }
}

\`\`\`

    
You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_**
And feel free to go crazy ~~crossing stuff out~~.

There's also [links](https://www.freecodecamp.com), and
> Block Quotes!

And if you want to get really crazy, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | ------------- 
Your content can | be here, and it | can be here....
And here. | Okay. | I think we get it.


- And of course there are lists.
  - With different indentation levels.
    - That look like this.
        - Some are bulleted.
     
1. And there are numbererd lists too.
1. Use just 1s if you want! 
1. But the list goes on...
- Even if you use dashes or asterisks.
* And last but not least, let's not forget embedded images:

![React Logo w/ Text](https://goo.gl/Umyytc)
`;

document.addEventListener('DOMContentLoaded', () => {
    const editor = document.querySelector('#editor');
    editor.value = placeHolder;
    const replacer = new Index();

    replacer.addBlockElementsToPrev(editor.value);
    write(editor, replacer);
});

function write(input, obj) {
    input.oninput = (e) => obj.addBlockElementsToPrev(e.target.value);
}


function Index() {
    this.previewer = document.querySelector('#previewer');
    this.blockPatterns = {
        heading1: /^#.+$/,
        heading2: /^#{2}.+$/,
        heading3: /^#{3}.+$/,
        blockQuote: /^>.*$/,
        img: /!\[.*]\(.*\)/,
        multilineCode: /`{3}\n+[\s\S]+?\n+`{3}/,
        orderedList: /(\s*(1\.)\s+.+)(\s*(1\.|-|\*)\s+.+)+/,
        unorderedList: /^(\s*-\s+.+\s*)+$/,
        table: /((.+)(\|.+)+)\n(([-\s]+)(\|[-\s]+)+)(\n(.+)(\|.+)+)+/,

    };
    this.divideTextPatterns = {
        multilineCode: /^`{3}$/,
        orderedList: [/^\s*1\.\s+.+$/, /^(\s*(1\.|\*|-)\s+.+|\n)$/],
        unorderedList: [/^\s*-\s+.+$/, /^(\s*-\s+.+|\n)$/],
        table: [/^(\s*([-\s]+)(\|[-\s]+)+|\n)$/, /^(\s*(.+)(\|.+)+|\n)$/]
    };
    this.classNames = {
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
    };
}

Index.prototype.divideTextToBlockElements = function (text) {
    const array = text.match(/.+|\n+/g);
    let i = 0;
    this.arr = [];

    while (i < array.length) {
        if (this.divideTextPatterns.multilineCode.test(array[i])) {
            const lastIndex = array.indexOf('```', i + 1);
            i = this.addBlockToArr(array, i, lastIndex);
        } else if (this.divideTextPatterns.orderedList[0].test(array[i])) {
            i = this.addBlockToArr(array, i, this.divideTextPatterns.orderedList[1]);
        } else if (this.divideTextPatterns.unorderedList[0].test(array[i])) {
            i = this.addBlockToArr(array, i, this.divideTextPatterns.unorderedList[1]);
        } else if (this.divideTextPatterns.table[0].test(array[i])) {
            i = this.addBlockToArr(array, i, this.divideTextPatterns.table[1]);
        } else {
            this.arr.push(array[i]);
            i++;
        }
    }

    this.arr = this.arr.filter(v => v.trim() !== '');

};

Index.prototype.addBlockToArr = function (arr, idx, loopArg = -1) {
    const subArr = [arr[idx]];
    let j = idx + 1;

    if (loopArg > -1) {
        while (j <= loopArg) {
            subArr.push(arr[j]);
            j++
        }
        this.arr.push(subArr.join(''));
    } else if (this.divideTextPatterns.table[0].test(arr[idx])) {
        while (loopArg.test(arr[j])) {
            subArr.push(arr[j]);
            j++;
        }

        if (this.divideTextPatterns.table[1].test(this.arr[this.arr.length - 1])) {
            let str = this.arr[this.arr.length - 1];
            str += subArr.join('');
            this.arr[this.arr.length - 1] = str;
        } else {
            this.arr.push(subArr.join('\n'));
        }
    } else if (this.divideTextPatterns.orderedList[1].test(arr[idx]) || this.divideTextPatterns.unorderedList[1].test(arr[idx])) {
        while (loopArg.test(arr[j])) {
            subArr.push(arr[j]);
            j++;
        }

        this.arr.push(subArr.join('\n'));
    }

    return j;
};

Index.prototype.addBlockElementsToPrev = function (text) {

    while (this.previewer.firstChild) {
        this.previewer.firstChild.remove();
    }

    this.divideTextToBlockElements(text);
    for (let i = 0; i < this.arr.length; i++) {
        if (this.blockPatterns.heading3.test(this.arr[i])) {
            this.createBlockTxtElement(i, 'h3');
        } else if (this.blockPatterns.heading2.test(this.arr[i])) {
            this.createBlockTxtElement(i, 'h2');
        } else if (this.blockPatterns.heading1.test(this.arr[i])) {
            this.createBlockTxtElement(i, 'h1');
        } else if (this.blockPatterns.blockQuote.test(this.arr[i])) {
            this.createBlockTxtElement(i, 'blockquote');
        } else if (this.blockPatterns.img.test(this.arr[i])) {
            this.setImgElement(i);
        } else if (this.blockPatterns.multilineCode.test(this.arr[i])) {
            this.setBlockCode(i);
        } else if (this.blockPatterns.orderedList.test(this.arr[i])) {
            this.setOrderedList(i);
        } else if (this.blockPatterns.unorderedList.test(this.arr[i])) {
            this.setUnorderedList(i);
        } else if (this.blockPatterns.table.test(this.arr[i])) {
            this.setTable(i);
        } else {
            this.createBlockTxtElement(i, 'p');
        }
    }
};

Index.prototype.createBlockTxtElement = function (idx, tag) {
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
    element.className = this.classNames[tag];
    element.id = 'previewerBlockElement-' + idx;
    element.appendChild(content);
    this.setInlineElement(element);
    this.previewer.appendChild(element);
};

Index.prototype.setImgElement = function (idx) {
    const str = this.arr[idx];
    const src = str.slice(str.indexOf('(') + 1, str.indexOf(')')).trim();
    const alt = str.slice(str.indexOf('[') + 1, str.indexOf(']')).trim();

    const div = document.createElement('div');
    div.className = 'previewerImageWrapper';
    div.id = 'previewerBlockElement-' + idx;

    const img = document.createElement('img');
    img.className = this.classNames['img'];
    img.src = src;
    img.alt = alt;

    div.appendChild(img);
    this.previewer.appendChild(div);
};

Index.prototype.setBlockCode = function (idx) {
    let str = this.arr[idx];
    str = str.slice(3, str.length - 3).trim();
    const content = document.createTextNode(str);
    const code = document.createElement('code');
    code.appendChild(content);

    const pre = document.createElement('pre');
    pre.className = this.classNames['pre'];
    pre.id = 'previewerBlockElement-' +  idx;
    pre.appendChild(code);
    this.previewer.appendChild(pre);
};

Index.prototype.setOrderedList = function (idx) {
    let str = this.arr[idx];
    const listArr = str.split('\n').filter(v => v.trim() !== '');
    const orderedList = document.createElement('ol');
    orderedList.className = this.classNames['ol'];
    orderedList.id = 'previewerBlockElement-' + idx;

    listArr.forEach((v) => {
        const li = document.createElement('li');
        const txt = v.match(/^(\S+)\s(.+)/)[2].trim();
        const content = document.createTextNode(txt);
        li.appendChild(content);
        this.setInlineElement(li);
        orderedList.appendChild(li);
    });

    this.previewer.appendChild(orderedList);
};

Index.prototype.setUnorderedList = function (idx) {
    let strArr = this.arr[idx].split('\n').filter(v => v.trim() !== '');
    let i = 0;

    (function createList(depth, parent = this.previewer) {
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
                Index.prototype.setInlineElement(li);
                parent.appendChild(li);
                i++;
            } else {
                if (parent !== this.previewer) {
                    parent = parent.lastChild;
                }

                const ul = document.createElement('ul');
                ul.className = 'previewerUnorderedList';
                createList(whiteSignsLength, ul);
                parent.appendChild(ul);
            }
        }
    })(-1);
};

Index.prototype.setTable = function(idx) {
    const arr = this.arr[idx].split('\n');
    const table = document.createElement('table');
    table.className = this.classNames['table'];
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
    this.previewer.appendChild(table);
};

Index.prototype.setInlineElement = function (element) {
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
};