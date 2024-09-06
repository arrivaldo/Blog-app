import React from 'react'
import { Link } from 'react-router-dom'

// import { format, compareAsc } from "date-fns";

const Post = ({_id, title, summary, cover, content, createdAt, author }) => {
  const formattedDate = new Date(createdAt).toLocaleString();


  return (
<div className="post">
        <div className="image">
          <Link to={`/post/${_id}`}>
          <img alt='post' src={'http://localhost:4000/'+cover}></img>
          </Link>
        </div>
        <div className="texts">
        <Link to={`/post/${_id}`}>

          <h2>{title}</h2>
          </Link>

          <p className="info">
            <span className="author">{author.username} </span>
            <time>{formattedDate}</time>
            </p>

          <p className="summary">{summary}</p>
        </div>
      </div>  )
}

export default Post