total_num = 3
sel_num = 3
sent_num = 2
file_name = 'demo.txt'
fw = open(file_name, 'w', encoding='utf-8')


for i in range(1,total_num+1):
	
	fw.write("Context{}\t".format(i))
	fw.write("Post{}\t".format(i)  )

	for j in range(sent_num):
		fw.write("Sent{}\t".format(j))

	for j in range(sent_num*sel_num):
		fw.write('{}\t'.format(i%3))

	fw.write('\n')
