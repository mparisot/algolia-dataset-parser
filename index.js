"use strict";

var sitemap = require('sitemapper');
var Nightmare = require('nightmare');
var vo = require('vo');
var algoliasearch = require('algoliasearch');
var fs = require('fs');

var configurationFile = "config.json";

process.setMaxListeners(0);

var configuration = JSON.parse(
    fs.readFileSync(configurationFile)
);

sitemap.getSites(configuration.sitemap, function(err, sites) {

    var client = algoliasearch(configuration.algolia.id, configuration.algolia.key);
    var index = client.initIndex(configuration.algolia.index);

    index.clearIndex(function(err) {
        if (err) {
            console.error(err);
            return;
        }
    });

    sites.forEach(currentPage => {
        console.log(`Parsing '${currentPage}'`);
        vo(function* () {
            let parser = Nightmare({show:false});
            let title = yield parser.goto(currentPage).wait('body').evaluate(() => {
                var indexedData = {page:window.location.href};
                var tags = document.querySelectorAll('[data-algolia-name]');
                var setIndexValue = function(indexName, indexValue) {
                    var parents = indexName.split('.');
                    var currentChildren = this;
                    var indexRealName = parents.pop();
                    parents.forEach(function(parent) {
                        if(!currentChildren.hasOwnProperty(parent)) {
                            currentChildren[parent] = {};
                        }
                        currentChildren = currentChildren[parent];
                    });

                    currentChildren[indexRealName] = indexValue;
                };

                for(var i = 0; i < tags.length; i++) {
                    var tagToIndex = tags[i];
                    var indexName = tagToIndex.dataset.algoliaName;
                    var indexSeparator = tagToIndex.dataset.algoliaSeparator;
                    var indexValue = tagToIndex.dataset.algoliaValue ? tagToIndex.dataset.algoliaValue : tagToIndex.innerText;

                    if(indexSeparator) {
                        indexValue = indexValue.split(indexSeparator);
                    }

                    setIndexValue.call(indexedData,indexName,indexValue);
                }
                return indexedData;
            });

            yield parser.end();

            return title;
        })(function (err, result) {
            if (err) return console.log(currentPage,err);
            index.addObject(result, function(err, content) {
                if(err) {
                    console.log(`Error while indexing '${currentPage}' : ${err}`);
                }
                console.log(`Done indexing '${currentPage}', found keys : ${Object.keys(result)}`);
            });
        });
    });
});