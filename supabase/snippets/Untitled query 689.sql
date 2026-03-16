create table Tasks (
  id bigint generated redo always as identity primary key,
  task text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);