import styled from 'styled-components'

export const Navigation = styled.nav`
  display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;
  padding: 1rem; margin-bottom: 1.5rem; background: #172334; color: white;
  border-radius: 8px;
  a { color: #d8eaff; text-decoration: none; font-weight: 600; }
  a[aria-current="page"] { color: white; text-decoration: underline; text-underline-offset: 5px; }
  span { margin-left: auto; }
`
export const StyledForm = styled.form`
  display: grid; gap: .5rem; padding: 1.25rem;
  border: 1px solid #c5d1df; border-radius: 8px; background: #f7faff;
  label { margin: .25rem 0; }
  input { background: white; padding: .65rem; }
  button[type="submit"] { background: #2358a5; color: white; border-color: #2358a5; }
`
export const Notification = styled.div`
  border: 1px solid ${p => p.$error ? '#a62f3c' : '#2e8051'};
  background: ${p => p.$error ? '#fff0f1' : '#eaf8ef'};
  color: ${p => p.$error ? '#8e1c29' : '#18512e'};
  padding: 1rem; border-radius: 8px; margin-bottom: 1rem;
`
export const BlogCard = styled.article`
  background: #f7faff; border: 1px solid #c5d1df;
  border-left: 4px solid #2358a5; border-radius: 8px;
  padding: 1.25rem; margin-block: 1rem; overflow-wrap: anywhere;
  h2 { margin-top: 0; color: #173b70; }
  a { color: #174e9c; }
  .like-count { font-weight: 700; margin-right: .5rem; }
  .remove { background: #fff0f1; border-color: #a62f3c; margin-top: .5rem; }
`
