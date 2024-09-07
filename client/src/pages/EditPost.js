import React, { useEffect, useState } from "react";
import Editor from '../Editor';
import { Navigate, useParams } from "react-router-dom";
import Image from '../Image'; // Import the Image component

const EditPost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null); // Change to null initially
    const [cover, setCover] = useState(''); // To store current cover image
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/post/' + id)
            .then(response => response.json())
            .then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
                setCover(postInfo.cover); // Set the existing cover image
            });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);

        if (files?.[0]) {
            data.set('file', files[0]); // Only set the file if a new one is uploaded
        }

        const response = await fetch('http://localhost:4000/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/post/' + id} />;
    }

    return (
        <form onSubmit={updatePost}>
            <input 
                type='text' 
                placeholder='Title' 
                value={title} 
                onChange={ev => setTitle(ev.target.value)} 
            />
            <input 
                type='text' 
                placeholder='Summary' 
                value={summary} 
                onChange={ev => setSummary(ev.target.value)} 
            />

            {/* Display the current image */}
            {cover && !files && (
                <div className="image-preview">
                    <p>Current Cover:</p>
                    <Image src={cover} alt="Current Cover" />
                </div>
            )}

            {/* Show a preview of the new image if a new file is selected */}
            {files && (
                <div className="image-preview">
                    <p>New Cover Preview:</p>
                    <Image src={URL.createObjectURL(files[0])} alt="New Cover Preview" />
                </div>
            )}

            {/* File input for uploading a new image */}
            <input 
                type='file' 
                onChange={ev => setFiles(ev.target.files)} 
            />

            <Editor onChange={setContent} value={content} />

            <button style={{ marginTop: '5px' }}>Update Post</button>
        </form>
    );
};

export default EditPost;
