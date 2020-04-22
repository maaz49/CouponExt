/**
 * tabList Util
 */
var TabList = function(){
    this._tabList = {};
};

TabList.prototype.put = function(tabId, tab) {
    this._tabList[tabId] = tab || {};
}

TabList.prototype.get = function(tabId) {
    return this._tabList[tabId] || {};
}

TabList.prototype.set = function(tabId, key, value) {
    var tab = this.get(tabId);
    tab[key] = value;
    this.put(tabId, tab);
}

TabList.prototype.remove = function(tabId) {
    delete this._tabList[tabId];
}

TabList.prototype.clear = function(tabId) {
    this._tabList = {};
}

let tabListCreatedBySelf = new TabList();
let afsrcTabList = new TabList();
let overrideTabList = new TabList();
let flashIconTabList = new TabList();