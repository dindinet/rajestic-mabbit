//import h from "https://unpkg.com/preact@10.19.2/dist/preact.module.js";


const HeroSectionPreview = ({ title, subtitle, image, image_alt, align, actions, background, has_background, getAsset }) => {
  const imageUrl = getAsset(image);
  const backgroundImageUrl = getAsset(background?.background_image);

  return h("div", { class: "hero-section" },
    h("div", {
      class: "background-container",
      style: {
        backgroundColor: background?.background_color,
        backgroundImage: `url(${backgroundImageUrl})`,
        opacity: background?.background_image_opacity / 100,
      }
    }),
    h("div", { class: "container" },
      h("div", { class: `hero-section-content align-${align}` },
        h("h1", null, title),
        h("p", null, subtitle),
        h("div", { class: "actions" },
          actions?.map(action =>
            h("a", { href: action.url, class: `button ${action.style}` }, action.label)
          )
        )
      ),
      imageUrl && h("div", { class: "hero-section-image" },
        h("img", { src: imageUrl.toString(), alt: image_alt })
      )
    )
  );
};

const FeaturesSectionPreview = ({ title, features, getAsset }) => {
  return h("div", { class: "features-section" },
    h("div", { class: "container" },
      h("h2", null, title),
      h("div", { class: "features" },
        features?.map(feature => {
          const imageUrl = getAsset(feature.image);
          return h("div", { class: "feature" },
            imageUrl && h("div", { class: "feature-image" },
              h("img", { src: imageUrl.toString(), alt: feature.image_alt })
            ),
            h("div", { class: "feature-content" },
              h("h3", null, feature.title),
              h("p", null, feature.content),
              h("div", { class: "actions" },
                feature.actions?.map(action =>
                  h("a", { href: action.url, class: `button ${action.style}` }, action.label)
                )
              )
            )
          )
        })
      )
    )
  );
};

const BlogFeedSectionPreview = ({ title, show_recent, recent_count }) => {
  return h("div", { class: "blog-feed-section" },
    h("div", { class: "container" },
      h("h2", null, title),
      h("p", null, show_recent ? `Showing ${recent_count} recent posts.` : "Not showing recent posts.")
    )
  );
};

const CtaSectionPreview = ({ title, subtitle, actions, has_background, background_color }) => {
  return h("div", { 
    class: "cta-section",
    style: {
      backgroundColor: has_background ? background_color : 'transparent'
    }
  },
    h("div", { class: "container" },
      h("h2", null, title),
      h("p", null, subtitle),
      h("div", { class: "actions" },
        actions?.map(action =>
          h("a", { href: action.url, class: `button ${action.style}` }, action.label)
        )
      )
    )
  );
};

const PagePreview = ({ entry, getAsset }) => {
  const sections = entry.getIn(["data", "sections"]);
  if (!sections) {
    return h("div", null, "No sections defined.");
  }

  return h("div", { class: "page-preview" },
    sections.map(section => {
      const type = section.get("type");
      const props = { ...section.toJS(), getAsset };
      switch (type) {
        case "hero_section":
          return h(HeroSectionPreview, props);
        case "features_section":
          return h(FeaturesSectionPreview, props);
        case "blog_feed_section":
          return h(BlogFeedSectionPreview, props);
        case "cta_section":
          return h(CtaSectionPreview, props);
        // Add other section previews here
        default:
          return h("div", null, `Unknown section type: ${type}`);
      }
    })
  );
};

CMS.registerPreviewTemplate("pages", PagePreview);
