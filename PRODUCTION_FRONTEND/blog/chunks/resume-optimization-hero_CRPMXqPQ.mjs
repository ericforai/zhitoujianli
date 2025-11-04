const resumeOptimizationHero = new Proxy({"src":"/_astro/resume-optimization-hero.B2Ro6WlN.jpg","width":1200,"height":600,"format":"svg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/resume-optimization-hero.jpg";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/resume-optimization-hero.jpg");
							return target[name];
						}
					});

export { resumeOptimizationHero as default };
