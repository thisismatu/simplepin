#! /bin/bash
if [ -n "$1" ]; then
  touch tmp
  echo -e "1: API Token\n"
  curl -i -X GET "https://api.pinboard.in/v1/user/api_token/?format=json&auth_token=$1" -o "tmp"
  cat tmp
  echo -e "\n2: Last Update\n"
  curl -i -X GET "https://api.pinboard.in/v1/posts/update?format=json&auth_token=$1" -o "tmp"
  cat tmp
  rm tmp
else
  echo "Plz enter username:token"
fi