const interviewPreparationHero = new Proxy({"src":"/_astro/hero-image.DwIC_L_T.png","width":1600,"height":939,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/interview-preparation-hero.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("/root/zhitoujianli/blog/zhitoujianli-blog/src/assets/images/interview-preparation-hero.png");
							return target[name];
						}
					});

export { interviewPreparationHero as default };
