# Script to create word frequency tables #

rm(list = ls())

library("rjson")

# read in the json
json_file <- "threats.json"
json_data <- fromJSON(paste(readLines(json_file), collapse=""))

# bind it into a dataframe
x <- do.call(rbind.data.frame, json_data)

# get rid of linebreaks
x$threat_txt <- gsub('\\\n', ' ', x$threat_txt)

# write it as a csv
# This was used by others at the hack-day
write.csv(x, file = 'threats_json.csv', row.names = FALSE)

# Loop through each of the classifications
for(stat in c('EX','EW','CR','EN','VU')){
  
  print(paste('starting',stat))
  
  # get only our category of species
  CRspecies <- x[x$category == stat,]
  
  # get in a couple of extra packages
  # install.packages(c('tm','wordcloud'))
  # install.packages('SnowballC')
  library(tm)
  library(wordcloud)
  library(SnowballC)
  
  # create a corpus
  dir.create(paste(stat,'text',sep=''))
  
  write.table(x = paste(CRspecies$threat_txt, collapse = ' '),
              file=paste(stat, 'text/', stat, 'text.txt', sep=''),
              quote = FALSE, col.names = FALSE,
              sep = ' ', row.names = FALSE,)
  
  
  CRcorpus <- Corpus(DirSource(paste(stat,"text/",sep = '')))
  
  # get rid of words that we dont want using functions that already exist
  bad_words <- c('threats','major','also','may','due','threat',
                 'pres','comm','although','now','however','species')
  CRcorpus <- tm_map(CRcorpus, stripWhitespace)
  CRcorpus <- tm_map(CRcorpus, tolower)
  CRcorpus <- tm_map(CRcorpus, removeWords, c(bad_words, stopwords("english")))
  CRcorpus <- tm_map(CRcorpus, stemDocument)
  CRcorpus <- tm_map(CRcorpus, removeNumbers)
  CRcorpus <- tm_map(CRcorpus, removePunctuation)
  

  # What follow is a very hacky way of getting rid of plurals
  # it is pretty slow but works... mostly
  
  y <- unlist(strsplit(x=unlist(CRcorpus), split=' '))
  
  y <- y[y != '']
  
  print('Doing plurals')
  for(i in 1:length(y)){
    	
    if(grepl('[A-z]+s\\b', y[i])){#if plural
      
      singular <- substr(y[i], start = 1, stop = nchar(y[i])-1)
      
      if(singular %in% y){# if valid singluar
        
        y[i] <- singular # make it singular
        
      }    
    }
  }
  
  # get los back in
  ##BUG HERE, TURNS 'loss' into 'losss'###
  y <- gsub('los', 'loss', y)
  
  print('Done plurals')

  # collapse y
  y <- paste(y, collapse = ' ')
  
  # write out
  write.table(x = y,
              file=paste(stat,'text/', stat, 'text.txt', sep = ''),
              quote = FALSE, col.names = FALSE,
              sep = ' ', row.names = FALSE,)
  
  # make it back into a corpus
  yCorp <- Corpus(DirSource(paste(stat,"text/",sep='')))
  
  # create the frequency table
  tdm <- TermDocumentMatrix(yCorp)
  m <- as.matrix(tdm)
  v <- sort(rowSums(m),decreasing=TRUE)
  d <- data.frame(word = names(v),freq=v)
  
  # save the frequency table
  print('Write out table')
  write.table(d[1:100,],
              file = paste(stat,'_word_freq.csv', sep = ''),
              row.names = FALSE,
              col.names = FALSE,
              sep = ',')
  
  print('Done')
  
  # # R wordcloud
  # WC <- wordcloud(y, scale=c(5,0.5), max.words=100,
  #           random.order=FALSE, rot.per=0.35,
  #           use.r.layout=FALSE, colors=brewer.pal(8, "Dark2"))
  #   
  
}