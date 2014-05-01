const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Home.jsm");
Cu.import("resource://gre/modules/HomeProvider.jsm");
Cu.import("resource://gre/modules/Messaging.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Task.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const PANEL_ID_LIST = "kitchen.sink.list@margaretleibovic.com";
const PANEL_ID_GRID = "kitchen.sink.grid@margaretleibovic.com";
const PANEL_ID_HUGE = "kitchen.sink.huge@margaretleibovic.com";
const PANEL_ID_EMPTY = "kitchen.sink.empty@margaretleibovic.com";

const DATASET_ID = "kitchen.sink.dataset@margaretleibovic.com";
const DATASET_HUGE_ID = "kitchen.sink.dataset.huge@margaretleibovic.com";

XPCOMUtils.defineLazyGetter(this, "NativeWindow", function() {
  let win = Services.wm.getMostRecentWindow("navigator:browser");
  return win.NativeWindow;
});

/**
 * An array of test panels that test various APIs.
 *
 * TODO:
 * - auth views
 * - filters
 * - refresh callback
 */
var gTestPanels = [
  { 
    id: PANEL_ID_LIST,
    optionsCallback: function () {
      return {
        title: "Test List",
        views: [{
          type: Home.panels.View.LIST,
          dataset: DATASET_ID
        }],
        oninstall: function () {
          NativeWindow.toast.show("List panel oninstall callback fired", "short");
        },
        onuninstall: function () {
          NativeWindow.toast.show("List panel onuninstall callback fired", "short");
        }
      };
    }
  },
  { 
    id: PANEL_ID_GRID,
    optionsCallback: function () {
      return {
        title: "Test Grid",
        views: [{
          type: Home.panels.View.GRID,
          dataset: DATASET_ID
        }]
      };
    }
  },
  {
    id: PANEL_ID_HUGE,
    optionsCallback: function () {
      return {
        title: "Huge List",
        views: [{
          type: Home.panels.View.LIST,
          dataset: DATASET_HUGE_ID
        }]
      };
    }
  },
  {
    id: PANEL_ID_EMPTY,
    optionsCallback: function () {
      return {
        title: "Test Empty",
        views: [{
          type: Home.panels.View.LIST,
          dataset: "does.not.exist",
          empty: {
            text: "This is some test emtpy text",
            image_url: ""
          }
        }]
      };
    }
  }
];

/**
 * An array of test data items.
 *
 * TODO:
 * - images
 * - filters
 * - complete matrix of possibilities
 */
var gTestItems = [
  {
    url: "http://example.com/1",
    title: "First Example",
    description: "This is an example",
  },
  {
    url: "http://example.com/2",
    title: "Second Example",
    description: "This is an example that has a long description so that we can test what happens when the description is very long"
  },
  {
    url: "http://example.com/3",
    title: "Example with a long title so that we can test what happens when the title is long",
    description: "This is an example that has a long description so that we can test what happens when the description is very long"
  },
  {
    url: "http://example.com/4",
    title: "Example with short title"
  },
  {
    url: "http://example.com/5",
    title: "Example with a long title so that we can test what happens when the title is long"
  },
  {
    url: "http://example.com/6",
    description: "This is an example that has a long description so that we can test what happens when the description is very long"
  },
  {
    url: "http://example.com/7",
    description: "Example with short description"
  },
  {
    url: "http://example.com/8",
    title: "First Example",
    description: "This is an example",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/9",
    title: "Second Example",
    description: "This is an example that has a long description so that we can test what happens when the description is very long",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/10",
    title: "Example with a long title so that we can test what happens when the title is long",
    description: "This is an example that has a long description so that we can test what happens when the description is very long",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/11",
    title: "Example with short title",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/12",
    title: "Example with a long title so that we can test what happens when the title is long",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/13",
    description: "This is an example that has a long description so that we can test what happens when the description is very long",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/14",
    description: "Example with short description",
    image_url: "http://static.goal.com/165000/165068_thumb.jpg"
  },
  {
    url: "http://example.com/15",
    title: "Empty string image_url",
    image_url: ""
  },
  {
    url: "http://example.com/16",
    title: "null image_url",
    image_url: null
  },
  {
    url: "http://example.com/17",
    title: "undefined image_url",
    image_url: undefined
  }
];

var gTestItemsHuge = [];
for (let i = 0; i < 100000; i++) {
  gTestItemsHuge.push({
    url: "http://example.com/" + i,
    title: "Test item #" + i
  })
}

function refreshDatasets() {
  Task.spawn(function() {
    let storage = HomeProvider.getStorage(DATASET_ID);
    yield storage.deleteAll();
    yield storage.save(gTestItems);

    let storageHuge = HomeProvider.getStorage(DATASET_HUGE_ID);
    yield storageHuge.deleteAll();
    yield storageHuge.save(gTestItemsHuge);
  }).then(null, e => Cu.reportError("Error refreshing datasets: " + e));
}

function deleteDatasets() {
  Task.spawn(function() {
    let storage = HomeProvider.getStorage(DATASET_ID);
    yield storage.deleteAll();

    let storage = HomeProvider.getStorage(DATASET_HUGE_ID);
    yield storage.deleteAll();
  }).then(null, e => Cu.reportError("Error deleting data from HomeProvider: " + e));
}

/**
 * bootstrap.js API
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 */
function startup(data, reason) {
  gTestPanels.forEach(function (panel) {
    Home.panels.register(panel.id, panel.optionsCallback);
  });

  switch(reason) {
    case ADDON_INSTALL:
      gTestPanels.forEach(function (panel) {
        Home.panels.install(panel.id);
      });

      HomeProvider.requestSync(DATASET_ID, refreshDatasets);
      break;

    case ADDON_UPGRADE:
    case ADDON_DOWNGRADE:
      gTestPanels.forEach(function (panel) {
        Home.panels.update(panel.id);
      });
      break;
  }

  // Update data once every hour.
  HomeProvider.addPeriodicSync(DATASET_ID, 3600, refreshDatasets);
}

function shutdown(data, reason) {
  if (reason == ADDON_UNINSTALL || reason == ADDON_DISABLE) {
    gTestPanels.forEach(function (panel) {
      Home.panels.uninstall(panel.id);
    });
    deleteDatasets();
  }

  gTestPanels.forEach(function (panel) {
    Home.panels.unregister(panel.id);
  });
}

function install(data, reason) {}

function uninstall(data, reason) {}
