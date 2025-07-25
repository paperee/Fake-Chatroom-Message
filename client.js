var markdownOptions = {
    html: false,
    xhtmlOut: false,
    breaks: true,
    langPrefix: '',
    linkify: true,
    linkTarget: '_blank" rel="noreferrer',
    typographer:  true,
    quotes: `""''`,

    doHighlight: true,
    langPrefix: 'hljs language-',
    
    highlight: function (str, lang) {
        if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}

        return '';
    }
};

var md = new Remarkable('full', markdownOptions);
var allowImages = true;

function getDomain(link) {
    var a = document.createElement('a');
    a.href = link;
    return a.hostname;
}

md.renderer.rules.image = function (tokens, idx, options) {
    var src = Remarkable.utils.escapeHtml(tokens[idx].src);

    if (allowImages) {
        var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
        var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
        var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
        var suffix = options.xhtmlOut ? ' /' : '';
        return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + imgSrc + alt + title + suffix + ' referrerpolicy="no-referrer"></a>';
    }

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.link_open = function (tokens, idx, options) {
    var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
    var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
    return '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + Remarkable.utils.escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};

md.renderer.rules.text = function(tokens, idx) {
    tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

    if (tokens[idx].content.indexOf('?') !== -1) {
        tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
            var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
            var whiteSpace = '';
            if (match[0] !== '?') {
                whiteSpace = match[0];
            }
            return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
        });
    }

  return tokens[idx].content;
};

function verifyLink(link) {
    var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
    if (linkHref !== link.innerHTML) {
        return confirm('Warning, please verify this is where you want to go: ' + linkHref);
    }

    return true;
}

function $(query) {
     var res = document.querySelectorAll(query);
      return res.length==1 ? res[0] : res;
}

$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
    var e = event.toElement || event.relatedTarget;
    try {
        if (e.parentNode == this || e == this) {
         return;
      }
    } catch (e) {
        return;
    }
        $('#sidebar').classList.remove('expand');
}

function localStorageGet(key) {
    try {
        return window.localStorage[key]
    } catch (e) { }
}

function localStorageSet(key, val) {
    try {
        window.localStorage[key] = val
    } catch (e) { }
}

var None = ' ';
function pushMessage(args) {

    // Message container
    var messageEl = document.createElement('div');
    messageEl.id = args.ID;
    messageEl.classList.add('message');

    if (args.nick == '!') {
        messageEl.classList.add('warn');
    } else if (args.nick == '*') {
        messageEl.classList.add('info');
    } else if (args.uType == 'admin') {
        messageEl.classList.add('admin');
    } else if (args.uType == 'mod') {
        messageEl.classList.add('mod');
    }

    // Nickname
    var nickSpanEl = document.createElement('span');
    nickSpanEl.classList.add('nick');
    messageEl.appendChild(nickSpanEl);

    if (args.trip) {
        var tripEl = document.createElement('span');

        if (args.uType == 'mod') {
            tripEl.textContent = String.fromCodePoint(11088) + " " + args.trip + " ";
        } else {
            tripEl.textContent = args.trip + " ";
        }

        tripEl.classList.add('trip');
                if (args.hash) { tripEl.title = args.hash; }
        nickSpanEl.appendChild(tripEl);
    }

    if (args.nick) {
        var nickLinkEl = document.createElement('a');
        nickLinkEl.textContent = args.nick;

        if (args.nick === 'jeb_') {
            nickLinkEl.setAttribute("class","jebbed");
        } else if (args.color && /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(args.color)) {
            nickLinkEl.setAttribute('style', 'color:#' + args.color + ' !important');
        }

        nickLinkEl.title = args.time;
        nickLinkEl.onclick = function () {navigator.clipboard.writeText('ID: '+args.ID+'\nchatroom: '+args.chatroom+'\nchannel: '+args.channel+'\nnick: '+args.nick+'\ntrip: '+args.trip+'\nhash: '+args.hash+'\nuType: '+args.uType+'\ncolor: '+args.color+'\ntext: '+args.text+'\ntime: '+args.time);}
        nickSpanEl.appendChild(nickLinkEl);
    }

    var textEl = document.createElement('p');
    textEl.classList.add('text');
    textEl.innerHTML = md.render(args.text);

    messageEl.appendChild(textEl);
        $('#messages').appendChild(messageEl);
}

function showMessage(all) {
    for (i in all) {
        pushMessage(all[i]);
    }
}
