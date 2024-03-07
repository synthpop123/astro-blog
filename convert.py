import os
import sys
from bs4 import BeautifulSoup

def replace_img_urls(directory, old_host, new_host):
  for root, dirs, files in os.walk(directory):
    for file in files:
      if file.endswith('.html'):
        file_path = os.path.join(root, file)
        with open(file_path, 'r') as f:
          soup = BeautifulSoup(f, 'html.parser')

          img_tags = soup.find_all('img')

          for img_tag in img_tags:
            if img_tag.has_attr('src'):
              src = img_tag['src']
              if src.startswith(old_host):
                img_tag['src'] = new_host + src[len(old_host):]
              elif src.startswith('/'):
                img_tag['src'] = new_host + src[1:]

            if img_tag.has_attr('data-srcset'):
              src = img_tag['data-srcset']
              if src.startswith(old_host):
                img_tag['data-srcset'] = new_host + src[len(old_host):]
              elif src.startswith('/'):
                img_tag['data-srcset'] = new_host + src[1:]

          with open(file_path, 'w') as output_file:
            output_file.write(str(soup))

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print("Usage: python3 convert.py <directory>")
    sys.exit(1)

  directory = sys.argv[1]
  old_host = "https://blog.lkwplus.com"
  new_host = "https://9cbd6ef.webp.ee"

  replace_img_urls(directory, old_host, new_host)
