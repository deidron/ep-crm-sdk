/* Registration of the probe bundle in the loader of the platform.
   The path is taken from the platform itself rather than written by hand: the file is
   served by the same host as the page, so no separate server and no CORS are involved.
   RequireJS appends the extension on its own, hence the .js is cut off.

   The bundle is not an AMD module — it is an IIFE that leaves EpCrmProbe behind, so the
   shim declares that global as the exports of the module. There is nothing in deps: the
   bundle carries its own Angular and asks the platform for nothing.

   The registration alone loads nothing. The file is fetched on the first require, so the
   probe does not weigh on the pages of the platform. In the console of a page:
     require(['ep-crm-probe'], (probe) => probe.run()); */
(function () {
	const core = [globalThis.BPMSoft, globalThis.Terrasoft].find(function (platform) {
		return platform && typeof platform.getFileContentUrl === "function";
	});
	if (!core || typeof require === "undefined" || typeof require.config !== "function") {
		return;
	}
	require.config({
		paths: {
			"ep-crm-probe": core.getFileContentUrl("EpCrmDemo", "src/js/ep-crm-probe.js")
		},
		shim: {
			"ep-crm-probe": {
				exports: "EpCrmProbe"
			}
		}
	});
}());
