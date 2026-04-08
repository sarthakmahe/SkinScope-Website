import React from 'react';
import './Blog.css';
import { useLanguage } from '../../context/LanguageContext';

const Blog = () => {
  const { t } = useLanguage();

  const blogs = [
    {
      _id: 1,
      title: t('blog_1_title'),
      content: t('blog_1_content')
    },
    {
      _id: 2,
      title: t('blog_2_title'),
      content: t('blog_2_content')
    },
    {
      _id: 3,
      title: t('blog_3_title'),
      content: t('blog_3_content')
    },
    {
      _id: 4,
      title: t('blog_4_title'),
      content: t('blog_4_content')
    },
    {
      _id: 5,
      title: t('blog_5_title'),
      content: t('blog_5_content')
    },
    {
      _id: 6,
      title: t('blog_6_title'),
      content: t('blog_6_content')
    }
  ];

  return (
    <div className="blog-container">
      <h2>{t('blog_title')}</h2>

      {blogs.map((blog) => (
        <div key={blog._id} className="blog-post">
          <h3>{blog.title}</h3>
          <p>{blog.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Blog;
