let posts = [
  { id: 1, author: 'Radek', title: 'Some title', message: 'Some message' }
];

const comments = {
  1: [ { author: 'Commentator', message: 'Great post!', id: 1 } ],
}

const getPostId = url => {
  const match = url.match(/\d+/g);
  return match[1] || match[0]; // to avoid localhost:3000
}

const getResponse = (request) => {
  if (request.url.endsWith('apis')) {
    return new Response(JSON.stringify({ posts }));
  }
  if (request.url.endsWith('apis/add')) {
    request.json().then(post => posts = [
      ...posts,
      {
        ...post,
        id: new Date().getTime(),
      },
    ])
    return new Response('');
  }
  if (request.url.includes('apis/delete')) {
    request.json().then(({ id }) => posts = posts.filter(post => post.id !== Number(id)));
    return new Response('');
  }
  if (request.url.includes('comments/add')) {
    const postId = getPostId(request.url);
    request.json().then(comment => {
      if (!comments[postId]) {
        comments[postId] = [];
      }
      comments[postId] = [...comments[postId], {...comment, id: new Date().getTime()}];
    });
    return new Response('');
  }
  if (request.url.includes('comments/delete')) {
    const postId = request.url.match(/\d+/)[0];
    request.json().then(({ id }) => comments[postId] = comments[postId].filter(comment => comment.id !== id));
    return new Response('');
  }
  if (request.url.includes('comments')) {
    const postId = getPostId(request.url);
    return new Response(JSON.stringify({ comments: comments[postId] }));
  }
}

self.addEventListener('fetch', event => {
  if (event.request.url.includes('apis')) {
    const response = getResponse(event.request);
    event.respondWith(new Promise(resolve => {
      setTimeout(() => resolve(response), 3000);
    }));
  }
});
