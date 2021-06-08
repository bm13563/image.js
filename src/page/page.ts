// @ts-ignore
var diff = require("virtual-dom/diff");
var patch = require("virtual-dom/patch");

// @ts-ignore
var createElement = require("virtual-dom/create-element");
var VNode = require("virtual-dom/vnode/vnode");
var VText = require("virtual-dom/vnode/vtext");

var convertHTML = require("html-to-vdom")({
    VNode: VNode,
    VText: VText,
});

import { Image } from "../image/image";
import { IPosition } from "../image/types";

export class Page {
    name: string;
    child: Image;
    currentNode: HTMLElement;
    currentTree: any;
    newTree: any;
    renderProps: any = {};

    constructor(name: string) {
        this.name = name;
    }

    addRootImage(image: Image) {
        this.child = image;
        this.child.page = this;
        this.child.mount();
        this.newTree = this.convertHTMLWithKey(this.child.html);
        this.currentNode = createElement(this.newTree[0]);
        document.body.appendChild(this.currentNode);
        this.replaceRenderProps(this.newTree);
        this.currentTree = this.newTree;
    }

    update() {
        this.renderProps = {};
        this.child.mount();
        this.newTree = this.convertHTMLWithKey(this.child.html);
        this.render();
    }

    render() {
        const patches = diff(this.currentTree[0], this.newTree[0]);
        this.currentNode = patch(this.currentNode, patches);
        this.replaceRenderProps(this.newTree);
        this.currentTree = this.newTree;
    }

    convertHTMLWithKey(html: string) {
        return convertHTML(
            {
                getVNodeKey: function (attributes: any) {
                    return attributes.id;
                },
            },
            html,
        );
    }

    replaceRenderProps(tree) {
        tree.forEach((child: any) => {
            if (child.tagName !== "style" && child.tagName !== undefined) {
                for (let attribute in child.properties.attributes) {
                    if (
                        child.properties.attributes[attribute] in
                        this.renderProps
                    ) {
                        let lAttribute = attribute.toLowerCase();
                        const renderPropsKeys =
                            child.properties.attributes[attribute];
                        const target = document.querySelector(
                            `[${lAttribute}=${renderPropsKeys}]`,
                        );
                        target[lAttribute] = this.renderProps[renderPropsKeys];
                        return;
                    }
                }
                this.replaceRenderProps(child.children);
            }
        });
        return;
    }
}