import slugify from 'slugify';

export const generateSlug = (str: string) => {
  const randomCode = Math.random().toString(16).replace(/^0./, '');
  const slugedString = slugify(str, { lower: true });

  return `${slugedString}-${randomCode}`;
};
