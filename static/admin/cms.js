const run = () => {
    const check = () => {
        if (window.CMS && window.h) {
            initPreviews();
        } else {
            setTimeout(check, 100);
        }
    };

    const initPreviews = () => {
        const CMS = window.CMS;
        const h = window.h;

        // --- Child Preview Components ---

        const HeroSectionPreview = (props) => {
            const { title, subtitle, image, image_alt, align, actions, background, getAsset } = props;
            const imageUrl = getAsset(image);
            const backgroundImageUrl = getAsset(background?.background_image);

            return h('div', { className: 'hero-section' },
                h('div', {
                    className: 'background-container',
                    style: {
                        backgroundColor: background?.background_color,
                        backgroundImage: `url(${backgroundImageUrl})`,
                        opacity: background?.background_image_opacity / 100,
                    }
                }),
                h('div', { className: 'container' },
                    h('div', { className: `hero-section-content align-${align}` },
                        h('h1', null, title),
                        h('p', null, subtitle),
                        h('div', { className: 'actions' },
                            actions?.map(action =>
                                h('a', { href: action.url, className: `button ${action.style}` }, action.label)
                            )
                        )
                    ),
                    imageUrl && h('div', { className: 'hero-section-image' },
                        h('img', { src: imageUrl.toString(), alt: image_alt })
                    )
                )
            );
        };

        const FeaturesSectionPreview = (props) => {
            const { title, features, getAsset } = props;
            return h('div', { className: 'features-section' },
                h('div', { className: 'container' },
                    h('h2', null, title),
                    h('div', { className: 'features' },
                        features?.map(feature => {
                            const imageUrl = getAsset(feature.image);
                            return h('div', { className: 'feature' },
                                imageUrl && h('div', { className: 'feature-image' },
                                    h('img', { src: imageUrl.toString(), alt: feature.image_alt })
                                ),
                                h('div', { className: 'feature-content' },
                                    h('h3', null, feature.title),
                                    h('p', null, feature.content),
                                    h('div', { className: 'actions' },
                                        feature.actions?.map(action =>
                                            h('a', { href: action.url, className: `button ${action.style}` }, action.label)
                                        )
                                    )
                                )
                            )
                        })
                    )
                )
            );
        };

        const BlogFeedSectionPreview = (props) => {
            const { title, show_recent, recent_count } = props;
            return h('div', { className: 'blog-feed-section' },
                h('div', { className: 'container' },
                    h('h2', null, title),
                    h('p', null, show_recent ? `Showing ${recent_count} recent posts.` : "Not showing recent posts.")
                )
            );
        };

        const CtaSectionPreview = (props) => {
            const { title, subtitle, actions, has_background, background_color } = props;
            return h('div', {
                className: 'cta-section',
                style: {
                    backgroundColor: has_background ? background_color : 'transparent'
                }
            },
                h('div', { className: 'container' },
                    h('h2', null, title),
                    h('p', null, subtitle),
                    h('div', { className: 'actions' },
                        actions?.map(action =>
                            h('a', { href: action.url, className: `button ${action.style}` }, action.label)
                        )
                    )
                )
            );
        };


        // --- Main Page Preview Component ---

        const PagePreview = (props) => {
            const entry = props.entry;
            const getAsset = props.getAsset;
            
            const sections = entry.getIn(['data', 'sections']);

            if (!sections) {
                return h('div', null, 'No sections found on this page.');
            }

            const sections_array = sections.toJS();

            const section_widgets = sections_array.map(section => {
                const type = section.type;
                const component_props = { ...section, getAsset: getAsset };

                switch (type) {
                    case 'hero_section':
                        return h(HeroSectionPreview, component_props);
                    case 'features_section':
                        return h(FeaturesSectionPreview, component_props);
                    case 'blog_feed_section':
                        return h(BlogFeedSectionPreview, component_props);
                    case 'cta_section':
                        return h(CtaSectionPreview, component_props);
                    default:
                        return h('div', null, `Unknown section type: ${type}`);
                }
            });

            return h('div', { className: 'page-preview' }, section_widgets);
        };

        CMS.registerPreviewTemplate("home", PagePreview);
    };

    check();
};

window.addEventListener('DOMContentLoaded', run);
