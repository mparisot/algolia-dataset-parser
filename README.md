# Indexation helper for Algolia

## Installation

```sh
npm install
npm start
```

## Configuration

In order to work you need to create a `config.json` file based on the `config.json.sample` file provided.

In this file you have to set the following properties :

* **sitemap** : The complete URL to your sitemap
* **algolia.id** : Your algolia ident to use their API
* **algolia.key** : Your algolia private key to use their API
* **algolia.index** : Your algolia index name

Be careful to not add this file in your repo because it contains your private key !

## How to make it work with your pages

In order to parse your pages, this script needs a few actions on your part.

Firstly, the pages that you want to be indexed need to be in your sitemap.

Then you need to adapt your page templates to add metadata about what to index and how.

The metadata are HTML data-* attributes added to the node you want to index.

The following attributes are available :

* **data-algolia-name** : Add a new attribute to your indexation. The attribute name will be the value passed in parameter. If the name contains a `.` it will create an object hierachy automatically.
* **data-algolia-value** : Set the value for the attribute to index. If you do not add this metadata, the textual content of the node will be used as value.
* **data-algolia-separator** : If you add this attribute, it will split the content by using the value passed as separator and create an array

The script automatically add a `page` attribute that will contains the full url of the page indexed.

## Example

The following sample :

```html
<header>
    <div class="author" data-agolia-name="meta.author">Mathieu Parisot</div>
    <div class="publication-date" data-agolia-name="meta.publication" data-algolia-value="1449685840311">09/12/2015</div>
    <div class="tags" data-algolia-name="tags" data-algolia-separator=", ">javascript, html, css</div>
</header>
<article data-algolia-name="content">
    <h1>My great article to be indexed</h1>
    <p>This all will be indexed as plain text!</p>
</article>
```

Will give you the following data :

```javascript
{
    page: 'the/url/of/your/page.html',
    meta: {
        author: "Mathieu Parisot",
        publication: 1449685840311,
        tags: ['javascript','html','css']
    },
    content: 'My great article to be indexed\nThis all will be indexed as plain text!'
}
```