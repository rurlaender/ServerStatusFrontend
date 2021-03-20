function setValue(name, value) {
	document.getElementById(name).setAttribute('value', value);
}

function Sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function setValues(values) {
	setValue('temp', values==null?0:values.temperature.cpu);
	document.getElementById('temp_text').innerHTML = Math.round(values==null?0:values.temperature.cpu) + '°C';
	document.getElementById('frequency').innerHTML = values==null?0:values.cpus.frequency + 'Hz';
	setValue('cpu_1', values==null?0:values.cpus.cores[0]);
	setValue('cpu_2', values==null?0:values.cpus.cores[0]);
	setValue('cpu_3', values==null?0:values.cpus.cores[0]);
	setValue('cpu_4', values==null?0:values.cpus.cores[0]);
	//Network
	var network_html = ""
	values.network.forEach(element => {
		network_html += '<div class="row">'
		network_html += '  <div class="col-md-2"><b>Adapter: '+ element.name +'</b></div>';
		network_html += '  <div class="col-md-2">Up: '+ element.up +'</div>';
		network_html += '  <div class="col-md-4">Sent: '+ element.bytes_sent +'</div>';
		network_html += '  <div class="col-md-4">Received: '+ element.bytes_recv +'</div>';
		network_html += '</div>';
	});
	document.getElementById('network').innerHTML = network_html;

	//Disks
	var disk_html = ""
	values.disks.forEach(element => {
		disk_html += '<div class="row">'
		disk_html += '  <div class="col-md-3"><b>'+ element.name +'</b></div>';
		disk_html += '  <div class="col-md-3">Total: '+ element.total +'</div>';
		disk_html += '  <div class="col-md-3">Used: '+ element.used +'</div>';
		disk_html += '  <div class="col-md-3">Free: '+ element.free +'</div>';
		disk_html += '</div>';
	});
	document.getElementById('disks').innerHTML = disk_html;


	var users_str = "";
	if(values != null && values.users.length>0) {
		for(i=0;i< values.users.length; i++) {
			var date = new Date(values.users[i].started * 1000);
			if (i%2 == 0){
				users_str += '<p class="evan">'+ values.users[i].name +'@' + values.users[i].host + 
				             ' since ' + date.toLocaleDateString("de-DE") + ' ' + 
							 date.toLocaleTimeString("de-DE") + '</p>';
			}
			else
			{
				users_str += '<p class="odd">'+ values.users[i].name +'@' + values.users[i].host + 
				' since ' + date.toLocaleDateString("de-DE") + ' ' + 
				date.toLocaleTimeString("de-DE") + '</p>';
			}
			
		}
	}
	document.getElementById('users').innerHTML = users_str
}

function load_data() {
        var error = document.getElementById('error');
		$.ajax({
			url: 'http://appserver.fritz.box:5000',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({
				jsonrpc: '2.0',
				method: 'get_sys_state',
				id: '1',
				params: {}
			}),
			success: function(result) {
				if (result != null && result.error == null) {
                    error.style.display = 'none';
					setValues(result.result)
				} else {
					error.style.display = 'block';
					error.innerHTML = 'An error has occured: ' + result.error.message;
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				error.style.display = 'block';
				error.innerHTML = 'No connection to the backend';
				setValues(null)
			}
		});
}

async function poll() {
    load_data();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await poll()
}
