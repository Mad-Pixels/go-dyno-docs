function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    if (uri === '/') {
        var country = request.headers['cloudfront-viewer-country'];
        var lang = 'en'; 
        
        if (country && country.value) {
            switch (country.value) {
                case 'RU':
                case 'BY':
                case 'KZ':
                case 'KG':
                case 'UZ':
                case 'TJ':
                case 'AM':
                case 'AZ':
                case 'GE':
                case 'MD':
                case 'UA':
                    lang = 'ru';
                    break;
            }
        }
        
        return {
            statusCode: 302,
            statusDescription: 'Found',
            headers: {
                'location': { value: '/' + lang + '/' }
            }
        };
    }
    
    var len = uri.length;
    var lastChar = uri.charAt(len - 1);
    
    if (len > 5 && uri.charAt(len - 5) === '.' && 
        uri.charAt(len - 4) === 'h' && uri.charAt(len - 3) === 't' && 
        uri.charAt(len - 2) === 'm' && lastChar === 'l') {
        request.uri = uri.substring(0, len - 5);
        return request;
    }
    if (lastChar === '/') {
        request.uri = uri + 'index.html';
        return request;
    }
    
    var hasDot = false;
    for (var i = len - 1; i >= 0; i--) {
        if (uri.charAt(i) === '.') {
            hasDot = true;
            break;
        }
        if (uri.charAt(i) === '/') break;
    }
    
    if (!hasDot && len > 1) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: uri + '/' }
            }
        };
    }
    if (!hasDot) {
        request.uri = uri + '.html';
    }
    return request;
}