import requests
from bs4 import BeautifulSoup as bs
from openpyxl import Workbook

url = "https://www.cricbuzz.com/cricket-series/7607/indian-premier-league-2024"

r = requests.get(url)
soup = bs(r.text, "lxml")

# Headings
headingList =[]
headings = soup.find_all("h2", {"class": "cb-nws-hdln cb-font-18 line-ht24"})

for head in headings:
    headingList.append(head.text.strip())
    # print(head.text.strip())

# SubContent    
SubContentList =[]
SubContent = soup.find_all("div",{"class":"cb-nws-intr"})

for sub in SubContent:
    SubContentList.append(sub.text.strip())
    # print(sub.text.strip())



# Images
img_tagsList =[]
img_tags = soup.find_all("img", {"class": "cb-lst-img"})

for img in img_tags:
    img_tagsList.append(img['src'])
    # print("Image src:", img['src'])


# target links for para
targetLinksList = []
targetLinks = soup.find_all("a",{"class":"cb-nws-hdln-ancr text-hvr-underline"})
for link in targetLinks:
    targetLinksList.append("https://www.cricbuzz.com"+link['href'])
    # print("https://www.cricbuzz.com"+link['href'])

InnerPara = []
for target in targetLinksList:
    url2 = target
    r2 = requests.get(url2)
    soup2 = bs(r2.text, "lxml")
    paras = soup2.find_all("p", {"class": "cb-nws-para"})
    combined_paras = "\n".join([para.text.strip() for para in paras])
    InnerPara.append(combined_paras)
# print(InnerPara)


wb = Workbook()
ws = wb.active

headers = ["Heading", "SubContent", "ImageURL", "TargetLink", "InnerPara"]
ws.append(headers)

for i in range(len(headingList)):
    row = [headingList[i], SubContentList[i], img_tagsList[i], targetLinksList[i], InnerPara[i]]
    ws.append(row)

wb.save("scraped_data.xlsx")

print("Data saved to scraped_data.xlsx")