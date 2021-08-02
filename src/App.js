import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from "react-query";

const defaultOptions = { refetchOnWindowFocus: false };

const App = () => {
  const { isFetching, data } = useQuery('posts', async () => {
    const response = await fetch('apis');
    const { posts } = await response.json();
    return posts;
  }, defaultOptions);

  return (
      <>
        <h3>Posts:</h3>
        {isFetching && 'Loading posts...'}
        {data?.map(post => <Post key={post.id} post={post} />)}
        <AddPost />
      </>
  );
}

const AddPost = () => {
  const [post, setPost] = useState({ author: '', title: '', message: ''})

  const queryClient = useQueryClient();

  const { mutate, isSuccess, reset } = useMutation(comment => (
    fetch(`apis/add`, {
      method: 'POST',
      body: JSON.stringify(post),
    })
  ), {
    onSuccess: () => {
      queryClient.invalidateQueries('posts', {exact: true});
    }
  });

  const createOnChange = key => e => {
    if (isSuccess) {
      reset();
    }
    setPost(post => ({...post, [key]: e.target.value}));
  };

  const onSubmit = e => {
    e.preventDefault();
    mutate(post);
  };

  return (
    <form onSubmit={onSubmit}>
      <input placeholder="Author" value={post.author} onChange={createOnChange('author')} />
      <input placeholder="Title" value={post.title} onChange={createOnChange('title')} />
      <input placeholder="Message" value={post.message} onChange={createOnChange('message')} />
      <button type="submit">Add comment</button>
      <br />
      {isSuccess && 'post Successfully sent'}
    </form>
  );
}

const Post = ({ post }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <p key={post.id} style={{border: '1px solid red', padding: '4px'}}>
      <h4>{post.title}, <small>{post.author}</small></h4>
      <div>{post.message}</div>
      {!showComments && <button onClick={() => setShowComments(true)}>Show comments</button>}
      {showComments && <button onClick={() => setShowComments(false)}>Hide comments</button>}
      {showComments && <Comments postId={post.id} />}
    </p>
  )
}

const Comments = ({ postId }) => {
  const { isFetching, data } = useQuery(['comments', postId], async () => {
    const response = await fetch(`apis/comments/${postId}`);
    const { comments } = await response.json();
    return comments;
  }, defaultOptions);

  return (
    <>
      <h5>Comments</h5>
      {isFetching && 'Loading comments...'}
      {data?.map(comment => (
          <div key={comment.id} style={{border: '3px solid green', margin: '4px', padding: '4px'}}>
            <h6>{comment.author}</h6>
            <div>{comment.message}</div>
          </div>
        )
      )}
      <AddComment postId={postId} />
    </>
  )
}

const AddComment = ({ postId }) => {
  const [comment, setComment] = useState({ author: '', message: '' });

  const queryClient = useQueryClient();

  const { mutate, isSuccess, reset } = useMutation(['comments', postId], comment => (
    fetch(`apis/comments/add/${postId}`, {
      method: 'POST',
      body: JSON.stringify(comment),
    })
  ), {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId], {exact: true});
    }
  });

  const createOnChange = key => e => {
    if (isSuccess) {
      reset();
    }
    setComment(comment => ({...comment, [key]: e.target.value}));
  }

  return (
    <form onSubmit={e => {
      e.preventDefault();
      mutate(comment);
    }}>
      <input placeholder="Author" value={comment.author} onChange={createOnChange('author')} />
      <input placeholder="Message" value={comment.message} onChange={createOnChange('message')} />
      <button type="submit">Add comment</button>
      <br />
      {isSuccess && 'comment Successfully sent'}
    </form>
  );
}

export default App;
