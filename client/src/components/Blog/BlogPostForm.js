import React, { useState } from 'react';
import axios from 'axios';
import './BlogPostForm.css';
import { useLanguage } from '../../context/LanguageContext';
import { translateMessage } from '../../utils/translateMessage';
import getStoredToken from '../../utils/getStoredToken';

const BlogPostForm = () => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/blogs', { title, content }, {
        headers: { 'x-auth-token': getStoredToken() }
      });
      console.log(res.data);
      setTitle('');
      setContent('');
      setError('');
      setSuccess(t('blog_create_success'));
    } catch (err) {
      console.error(err);
      setSuccess('');
      setError(t('blog_create_error'));
    }
  };

  return (
    <div className="blog-post-form-container">
      <h2>{t('create_blog_title')}</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>{t('title_label')}</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{t('content_label')}</label>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">{t('submit_button')}</button>
        {success && <p>{success}</p>}
        {error && <p>{translateMessage(error, t)}</p>}
      </form>
    </div>
  );
};

export default BlogPostForm;
