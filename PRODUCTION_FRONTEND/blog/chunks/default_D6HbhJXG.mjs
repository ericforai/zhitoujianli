const _default = new Proxy({"src":"/_astro/default.CZ816Hke.png","width":2400,"height":1256,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/default.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/default.png");
							return target[name];
						}
					});

export { _default as default };
