# Displaying Related Content in Decap CMS Previews

This document outlines the approach for fetching and displaying entries from one collection within the preview of another. Specifically, it addresses how to show recent blog posts within the "Blog Feed" section preview on the home page.

The core challenge is that the `entry` prop available in a preview component only contains data for the page currently being edited. To display content from another collection (like blog posts), we must fetch that data separately.

### Using `CMS.getCollection(name)`

Decap CMS provides a global `CMS` object with methods to interact with the repository's collections. The method `CMS.getCollection(name)` is the key to solving this problem.

1.  **What it Does:** It fetches all the entries for a given collection that is defined in your `config.yml`.
2.  **Asynchronous Nature:** This is the most critical part. The method does **not** return the collection data directly. It returns a **Promise**. This means the preview component must handle this asynchronous operation, typically by managing an internal state and re-rendering when the data arrives.
3.  **Data Format:** The Promise, when it resolves, provides an `Immutable.List` of `Immutable.Map` objects. Each map represents a single entry (a post, in this case) and contains its metadata (`slug`, `path`, etc.) and its front matter data (in a nested `data` map). To work with this data easily in standard JavaScript, you must convert it using the `.toJS()` method.

### Proposed Solution & Implementation Sketch

Because the data fetching is asynchronous, the preview component needs to be "stateful." It will first render in a loading state, then trigger the data fetch, and finally re-render once the data has been successfully retrieved.

The standard way to handle this in a React-based component (which Decap previews are) is to:
a.  Have an internal state for the component (e.g., `this.state.posts`).
b.  Trigger the data fetch when the component is first mounted using the `componentDidMount` lifecycle method.
c.  Update the state when the data arrives, which causes the component to re-render with the new data.

Here is a conceptual sketch of how the `BlogFeedSectionPreview` in `cms.js` would look:

```javascript
// We'd use the createClass helper provided by Decap
const BlogFeedSectionPreview = createClass({
  // 1. Initialize the state to hold our posts and a loading flag
  getInitialState: function() {
    return { posts: [], isLoading: true };
  },

  // 2. This function runs automatically when the component is added to the page
  componentDidMount: function() {
    // Use the CMS global to fetch the 'blog' collection.
    // Note: The collection name ('blog') must match its 'name' in config.yml.
    CMS.getCollection('blog').then(collection => {
      const allPosts = collection.toJS();

      // 3. Process the posts: sort by date and get the latest 3
      const recentPosts = allPosts
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
        .slice(0, 3);

      // 4. Update the component's state with the fetched posts
      this.setState({ posts: recentPosts, isLoading: false });
    });
  },

  // 5. The render function uses the state to display the correct UI
  render: function() {
    const { entry } = this.props;
    const { posts, isLoading } = this.state;
    const title = entry.getIn(['data', 'title']);

    // Use the 'h' function (like React.createElement) to build the virtual HTML
    return h('section', { className: 'blog-feed' },
      h('h2', {}, title),
      isLoading
        ? h('p', {}, 'Loading recent posts...')
        : h('div', { className: 'posts-grid' },
            posts.map(post =>
              // This would be a "card" component showing post details.
              // Its structure should mimic your Hugo partial for a blog card.
              h('div', { className: 'post-card' },
                h('h3', {}, post.data.title),
                // We could even show the image if it's in the front matter
                post.data.image ? h('img', { src: post.data.image }) : null,
                h('p', {}, post.data.summary || '')
              )
            )
          )
    );
  }
});
```

### Summary of the Approach

*   **Feasibility:** This approach is entirely feasible and is the correct, recommended way to handle this requirement in Decap CMS.
*   **Key Steps:**
    1.  Modify the `BlogFeedSectionPreview` to be a stateful component using `createClass`.
    2.  Initialize its state in `getInitialState` to handle a `posts` array and an `isLoading` flag.
    3.  In the `componentDidMount` lifecycle method, call `CMS.getCollection('blog')`.
    4.  Inside the promise's `.then()` callback:
        *   Convert the immutable result to a plain JavaScript array with `.toJS()`.
        *   Sort the posts by date (newest first).
        *   Slice the array to get the desired number of recent posts (e.g., 3 or 6).
        *   Call `this.setState()` to store the posts and update the loading flag.
    5.  The `render` function will check the `isLoading` flag. It will show a "Loading..." message initially, and then it will map over the `posts` array in the state to render the preview cards once they have been fetched.

This creates a dynamic and realistic preview that accurately reflects what the final site will show, significantly improving the content editing experience.
