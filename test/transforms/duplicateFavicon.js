/*global describe, it*/
var expect = require('../unexpected-with-plugins'),
    passError = require('passerror'),
    AssetGraph = require('../../lib/AssetGraph'),
    urlTools = require('urltools');

describe('transforms.duplicateFavicon', function () {
    it('should handle a referenced favicon.ico', function (done) {
        new AssetGraph({root: __dirname + '/../../testdata/transforms/duplicateFavicon/referencedFavicon'})
            .loadAssets('index.html')
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain relations', 'HtmlShortcutIcon', 1);
            })
            .duplicateFavicon()
            .run(passError(done, function (assetGraph) {
                expect(assetGraph, 'to contain relation', 'HtmlShortcutIcon');
                expect(assetGraph, 'to contain relation', {type: 'HtmlShortcutIcon', href: 'favicon.copy.ico'});
                expect(assetGraph, 'to contain assets', 'Ico', 2);
                expect(assetGraph, 'to contain asset', {url: urlTools.resolveUrl(assetGraph.root, 'favicon.ico')});
                expect(assetGraph, 'to contain asset', {url: urlTools.resolveUrl(assetGraph.root, 'favicon.copy.ico')});
                expect(assetGraph.findAssets({type: 'Html'})[0].text, 'to equal',
                    '<!DOCTYPE html>\n' +
                    '<html>\n' +
                    '    <head>\n' +
                    '        <link rel="shortcut icon" href="favicon.copy.ico">\n' +
                    '    </head>\n' +
                    '    <body>\n' +
                    '    </body>\n' +
                    '</html>\n');
                done();
            }));
    });

    it('should handle an unreferenced favicon.ico', function (done) {
        new AssetGraph({root: __dirname + '/../../testdata/transforms/duplicateFavicon/unreferencedFavicon'})
            .loadAssets('index.html', 'noHead.html', 'favicon.ico')
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain relations', 'HtmlShortcutIcon', 0);
            })
            .duplicateFavicon()
            .run(passError(done, function (assetGraph) {
                expect(assetGraph, 'to contain relation', 'HtmlShortcutIcon', 2);
                expect(assetGraph, 'to contain assets', 'Ico', 2);
                expect(assetGraph, 'to contain asset', {url: urlTools.resolveUrl(assetGraph.root, 'favicon.ico'), isInitial: true});
                expect(assetGraph, 'to contain asset', {url: urlTools.resolveUrl(assetGraph.root, 'favicon.copy.ico'), isInitial: function (isInitial) {return !isInitial; }});
                expect(assetGraph.findAssets({type: 'Html', fileName: 'index.html'})[0].text, 'to equal',
                    '<!DOCTYPE html>\n' +
                    '<html>\n' +
                    '    <head>\n' +
                    '    <link rel="shortcut icon" href="favicon.copy.ico"></head>\n' +
                    '    <body>\n' +
                    '    </body>\n' +
                    '</html>\n'
                );
                expect(assetGraph.findAssets({type: 'Html', fileName: 'noHead.html'})[0].text, 'to equal',
                    '<!DOCTYPE html>\n' +
                    '<html><head><link rel="shortcut icon" href="favicon.copy.ico"></head>\n' +
                    '    <body>\n' +
                    '    </body>\n' +
                    '</html>\n'
                );
                done();
            }));
    });
});
