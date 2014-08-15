'use strict';

describe('$sailsSocket', function() {

    var callback;

    beforeEach(function() {
        callback = jasmine.createSpy('done');
    });

    beforeEach(module(function($exceptionHandlerProvider) {
        $exceptionHandlerProvider.mode('log');
    }));

    beforeEach(module('angularSails'));

    beforeEach(module('angularSailsMocks'));




    afterEach(inject(function($exceptionHandler, $sailsBackend, $rootScope) {
        angular.forEach($exceptionHandler.errors, function(e) {
            dump('Unhandled exception: ', e);
        });

        if ($exceptionHandler.errors.length) {
            throw 'Unhandled exceptions trapped in $exceptionHandler!';
        }

        $rootScope.$digest();
        $sailsBackend.verifyNoOutstandingExpectation();
    }));


    describe('$sailsSocketProvider', function() {
        describe('interceptors', function() {
            it('should chain request, requestReject, response and responseReject interceptors', function() {
                module(function($sailsSocketProvider) {
                    var savedConfig, savedResponse;
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            request: function(config) {
                                config.url += '/1';
                                savedConfig = config;
                                return $q.reject('/2');
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            requestError: function(error) {
                                savedConfig.url += error;
                                return $q.when(savedConfig);
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push(function() {
                        return {
                            responseError: function(rejection) {
                                savedResponse.data += rejection;
                                return savedResponse;
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            response: function(response) {
                                response.data += ':1';
                                savedResponse = response;
                                return $q.reject(':2');
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    var response;
                    $sailsBackend.expect('GET', '/url/1/2').respond('response');
                    $sailsSocket({method: 'GET', url: '/url'}).then(function(r) {
                        response = r;
                    });
                    $rootScope.$apply();
                    $sailsBackend.flush();
                    expect(response.data).toEqual('response:1:2');
                });
            });


            it('should verify order of execution', function() {
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            request: function(config) {
                                config.url += '/outer';
                                return config;
                            },
                            response: function(response) {
                                response.data = '{' + response.data + '} outer';
                                return response;
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            request: function(config) {
                                config.url += '/inner';
                                return config;
                            },
                            response: function(response) {
                                response.data = '{' + response.data + '} inner';
                                return response;
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend) {
                    var response;
                    $sailsBackend.expect('GET', '/url/outer/inner').respond('response');
                    $sailsSocket({method: 'GET', url: '/url'}).then(function(r) {
                        response = r;
                    });
                    $sailsBackend.flush();
                    expect(response.data).toEqual('{{response} inner} outer');
                });
            });
        });


        describe('request interceptors', function() {
            it('should pass request config as a promise', function() {
                var run = false;
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function() {
                        return {
                            request: function(config) {
                                expect(config.url).toEqual('/url');
                                expect(config.data).toEqual({one: "two"});
                                expect(config.headers.foo).toEqual('bar');
                                run = true;
                                return config;
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    $sailsBackend.expect('POST', '/url').respond('');
                    $sailsSocket({method: 'POST', url: '/url', data: {one: 'two'}, headers: {foo: 'bar'}});
                    $rootScope.$apply();
                    expect(run).toEqual(true);
                });
            });

            it('should allow manipulation of request', function() {
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function() {
                        return {
                            request: function(config) {
                                config.url = '/intercepted';
                                config.headers.foo = 'intercepted';
                                return config;
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    $sailsBackend.expect('GET', '/intercepted', null, function (headers) {
                        return headers.foo === 'intercepted';
                    }).respond('');
                    $sailsSocket.get('/url');
                    $rootScope.$apply();
                });
            });


            it('should allow replacement of the headers object', function() {
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function() {
                        return {
                            request: function(config) {
                                config.headers = {foo: 'intercepted'};
                                return config;
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    $sailsBackend.expect('GET', '/url', null, function (headers) {
                        return angular.equals(headers, {foo: 'intercepted'});
                    }).respond('');
                    $sailsSocket.get('/url');
                    $rootScope.$apply();
                });
            });

            it('should reject the http promise if an interceptor fails', function() {
                var reason = new Error('interceptor failed');
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function($q) {
                        return {
                            request: function(promise) {
                                return $q.reject(reason);
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    var success = jasmine.createSpy(), error = jasmine.createSpy();
                    $sailsSocket.get('/url').then(success, error);
                    $rootScope.$apply();
                    expect(success).not.toHaveBeenCalled();
                    expect(error).toHaveBeenCalledWith(reason);
                });
            });

            it('should not manipulate the passed-in config', function() {
                module(function($sailsSocketProvider) {
                    $sailsSocketProvider.interceptors.push(function() {
                        return {
                            request: function(config) {
                                config.url = '/intercepted';
                                config.headers.foo = 'intercepted';
                                return config;
                            }
                        };
                    });
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    var config = { method: 'get', url: '/url', headers: { foo: 'bar'} };
                    $sailsBackend.expect('GET', '/intercepted').respond('');
                    $sailsSocket.get('/url');
                    $rootScope.$apply();
                    expect(config.method).toEqual('get');
                    expect(config.url).toEqual('/url');
                    expect(config.headers.foo).toEqual('bar');
                });
            });

            it('should support interceptors defined as services', function() {
                module(function($provide, $sailsSocketProvider) {
                    $provide.factory('myInterceptor', function() {
                        return {
                            request: function(config) {
                                config.url = '/intercepted';
                                return config;
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push('myInterceptor');
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    $sailsBackend.expect('POST', '/intercepted').respond('');
                    $sailsSocket.post('/url');
                    $rootScope.$apply();
                });
            });

            it('should support complex interceptors based on promises', function() {
                module(function($provide, $sailsSocketProvider) {
                    $provide.factory('myInterceptor', function($q, $rootScope) {
                        return {
                            request: function(config) {
                                return $q.when('/intercepted').then(function(intercepted) {
                                    config.url = intercepted;
                                    return config;
                                });
                            }
                        };
                    });
                    $sailsSocketProvider.interceptors.push('myInterceptor');
                });
                inject(function($sailsSocket, $sailsBackend, $rootScope) {
                    $sailsBackend.expect('POST', '/intercepted').respond('');
                    $sailsSocket.post('/two');
                    $rootScope.$apply();
                });
            });
        });
    });


    describe('the instance', function() {
        var $sailsBackend, $sailsSocket, $rootScope;

        beforeEach(inject(function($injector) {

            $sailsBackend = $injector.get('$sailsBackend');

            callback = jasmine.createSpy();
        }));

        beforeEach(inject(['$rootScope', function($rs) {
            $rootScope = $rs;

            spyOn($rootScope, '$apply').andCallThrough();
        }]));

        beforeEach(inject(['$sailsBackend', '$sailsSocket', function($hb, $h) {
            $sailsBackend = $hb;
            $sailsSocket = $h;
        }]));

        it('should send GET requests if no method specified', inject(function($sailsBackend, $sailsSocket) {
            $sailsBackend.expect('GET', '/url').respond('');
            $sailsSocket({url: '/url'});
        }));

        it('should do basic request', inject(function($sailsBackend, $sailsSocket) {
            $sailsBackend.expect('GET', '/url').respond('');
            $sailsSocket({url: '/url', method: 'GET'});
        }));


        it('should pass data if specified', inject(function($sailsBackend, $sailsSocket) {
            $sailsBackend.expect('POST', '/url', 'some-data').respond('');
            $sailsSocket({url: '/url', method: 'POST', data: 'some-data'});
        }));


        describe('params', function() {
            it('should do basic request with params and encode', inject(function($sailsBackend, $sailsSocket) {
                $sailsBackend.expect('GET', '/url?a%3D=%3F%26&b=2').respond('');
                $sailsSocket({url: '/url', params: {'a=':'?&', b:2}, method: 'GET'});
            }));


            it('should merge params if url contains some already', inject(function($sailsBackend, $sailsSocket) {
                $sailsBackend.expect('GET', '/url?c=3&a=1&b=2').respond('');
                $sailsSocket({url: '/url?c=3', params: {a:1, b:2}, method: 'GET'});
            }));


            it('should jsonify objects in params map', inject(function($sailsBackend, $sailsSocket) {
                $sailsBackend.expect('GET', '/url?a=1&b=%7B%22c%22:3%7D').respond('');
                $sailsSocket({url: '/url', params: {a:1, b:{c:3}}, method: 'GET'});
            }));


            it('should expand arrays in params map', inject(function($sailsBackend, $sailsSocket) {
                $sailsBackend.expect('GET', '/url?a=1&a=2&a=3').respond('');
                $sailsSocket({url: '/url', params: {a: [1,2,3]}, method: 'GET'});
            }));


            it('should not encode @ in url params', function() {
                //encodeURIComponent is too agressive and doesn't follow http://www.ietf.org/rfc/rfc3986.txt
                //with regards to the character set (pchar) allowed in path segments
                //so we need this test to make sure that we don't over-encode the params and break stuff
                //like buzz api which uses @self

                $sailsBackend.expect('GET', '/Path?!do%26h=g%3Da+h&:bar=$baz@1').respond('');
                $sailsSocket({url: '/Path', params: {':bar': '$baz@1', '!do&h': 'g=a h'}, method: 'GET'});
            });

            it('should not add question mark when params is empty', function() {
                $sailsBackend.expect('GET', '/url').respond('');
                $sailsSocket({url: '/url', params: {}, method: 'GET'});
            });

            it('should not double quote dates', function() {
                if (typeof msie == 'undefined' || msie < 9) return;
                    $sailsBackend.expect('GET', '/url?date=2014-07-15T17:30:00.000Z').respond('');
                    $sailsSocket({url: '/url', params: {date:new Date('2014-07-15T17:30:00.000Z')}, method: 'GET'});
                });
            });


            describe('callbacks', function() {

                it('should pass in the response object when a request is successful', function() {
                    $sailsBackend.expect('GET', '/url').respond(207, 'my content', {'content-encoding': 'smurf'});
                    $sailsSocket({url: '/url', method: 'GET'}).then(function(response) {
                        expect(response.data).toBe('my content');
                        expect(response.status).toBe(207);
                        // expect(response.headers()).toEqual({'content-encoding': 'smurf'});
                        expect(response.config.url).toBe('/url');
                        callback();
                    });

                    $sailsBackend.flush();
                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should pass statusText in response object when a request is successful', function() {
                    $sailsBackend.expect('GET', '/url').respond(200, 'SUCCESS', {}, 'OK');
                    $sailsSocket({url: '/url', method: 'GET'}).then(function(response) {
                        expect(response.statusText).toBe('OK');
                        callback();
                    });

                    $sailsBackend.flush();
                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should pass statusText in response object when a request fails', function() {
                    $sailsBackend.expect('GET', '/url').respond(404, 'ERROR', {}, 'Not Found');
                    $sailsSocket({url: '/url', method: 'GET'}).then(null, function(response) {
                        expect(response.statusText).toBe('Not Found');
                        callback();
                    });

                    $sailsBackend.flush();
                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should pass in the response object when a request failed', function() {
                    $sailsBackend.expect('GET', '/url').respond(543, 'bad error', {'request-id': '123'});
                    $sailsSocket({url: '/url', method: 'GET'}).then(null, function(response) {
                        console.log(response)
                        expect(response.data).toBe('bad error');
                        expect(response.status).toBe(543);
                        expect(response.headers()).toEqual({'request-id': '123'});
                        expect(response.config.url).toBe('/url');
                        callback();
                    });

                    $sailsBackend.flush();
                    expect(callback).toHaveBeenCalledOnce();
                });


                describe('success', function() {
                    it('should allow http specific callbacks to be registered via "success"', function() {
                        $sailsBackend.expect('GET', '/url').respond(207, 'my content', {'content-encoding': 'smurf'});
                        $sailsSocket({url: '/url', method: 'GET'}).success(function(data, status, headers, config) {
                            expect(data).toBe('my content');
                            expect(status).toBe(207);
                            expect(headers()).toEqual({'content-encoding': 'smurf'});
                            expect(config.url).toBe('/url');
                            callback();
                        });

                        $sailsBackend.flush();
                        expect(callback).toHaveBeenCalledOnce();
                    });


                    it('should return the original http promise', function() {
                        $sailsBackend.expect('GET', '/url').respond(207, 'my content', {'content-encoding': 'smurf'});
                        var httpPromise = $sailsSocket({url: '/url', method: 'GET'});
                        expect(httpPromise.success(callback)).toBe(httpPromise);
                    });
                });


                describe('error', function() {
                    it('should allow http specific callbacks to be registered via "error"', function() {
                        $sailsBackend.expect('GET', '/url').respond(543, 'bad error', {'request-id': '123'});
                        $sailsSocket({url: '/url', method: 'GET'}).error(function(data, status, headers, config) {
                            expect(data).toBe('bad error');
                            expect(status).toBe(543);
                            expect(headers()).toEqual({'request-id': '123'});
                            expect(config.url).toBe('/url');
                            callback();
                        });

                        $sailsBackend.flush();
                        expect(callback).toHaveBeenCalledOnce();
                    });


                    it('should return the original http promise', function() {
                        $sailsBackend.expect('GET', '/url').respond(543, 'bad error', {'request-id': '123'});
                        var httpPromise = $sailsSocket({url: '/url', method: 'GET'});
                        expect(httpPromise.error(callback)).toBe(httpPromise);
                    });
                });
            });


            describe('response headers', function() {

                it('should return single header', function() {
                    $sailsBackend.expect('GET', '/url').respond('', {'date': 'date-val'});
                    callback.andCallFake(function(r) {
                        expect(r.headers('date')).toBe('date-val');
                    });

                    $sailsSocket({url: '/url', method: 'GET'}).then(callback);
                    $sailsBackend.flush();

                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should return null when single header does not exist', function() {
                    $sailsBackend.expect('GET', '/url').respond('', {'Some-Header': 'Fake'});
                    callback.andCallFake(function(r) {
                        r.headers(); // we need that to get headers parsed first
                        expect(r.headers('nothing')).toBe(null);
                    });

                    $sailsSocket({url: '/url', method: 'GET'}).then(callback);
                    $sailsBackend.flush();

                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should return all headers as object', function() {
                    $sailsBackend.expect('GET', '/url').respond('', {
                        'content-encoding': 'gzip',
                        'server': 'Apache'
                    });

                    callback.andCallFake(function(r) {
                        expect(r.headers()).toEqual({'content-encoding': 'gzip', 'server': 'Apache'});
                    });

                    $sailsSocket({url: '/url', method: 'GET'}).then(callback);
                    $sailsBackend.flush();

                    expect(callback).toHaveBeenCalledOnce();
                });


                it('should return empty object for jsonp request', function() {
                    callback.andCallFake(function(r) {
                        expect(r.headers()).toEqual({});
                    });

                    $sailsBackend.expect('JSONP', '/some').respond(200);
                    $sailsSocket({url: '/some', method: 'JSONP'}).then(callback);
                    $sailsBackend.flush();
                    expect(callback).toHaveBeenCalledOnce();
                });
            });


            describe('response headers parser', function() {
                /* global parseHeaders: false */

                it('should parse basic', function() {
                    var parsed = parseHeaders(
                        'date: Thu, 04 Aug 2011 20:23:08 GMT\n' +
                        'content-encoding: gzip\n' +
                        'transfer-encoding: chunked\n' +
                        'x-cache-info: not cacheable; response has already expired, not cacheable; response has already expired\n' +
                        'connection: Keep-Alive\n' +
                        'x-backend-server: pm-dekiwiki03\n' +
                        'pragma: no-cache\n' +
                        'server: Apache\n' +
                        'x-frame-options: DENY\n' +
                        'content-type: text/html; charset=utf-8\n' +
                        'vary: Cookie, Accept-Encoding\n' +
                        'keep-alive: timeout=5, max=1000\n' +
                        'expires: Thu: , 19 Nov 1981 08:52:00 GMT\n');

                        expect(parsed['date']).toBe('Thu, 04 Aug 2011 20:23:08 GMT');
                        expect(parsed['content-encoding']).toBe('gzip');
                        expect(parsed['transfer-encoding']).toBe('chunked');
                        expect(parsed['keep-alive']).toBe('timeout=5, max=1000');
                    });


                    it('should parse lines without space after colon', function() {
                        expect(parseHeaders('key:value').key).toBe('value');
                    });


                    it('should trim the values', function() {
                        expect(parseHeaders('key:    value ').key).toBe('value');
                    });


                    it('should allow headers without value', function() {
                        expect(parseHeaders('key:').key).toBe('');
                    });


                    it('should merge headers with same key', function() {
                        expect(parseHeaders('key: a\nkey:b\n').key).toBe('a, b');
                    });


                    it('should normalize keys to lower case', function() {
                        expect(parseHeaders('KeY: value').key).toBe('value');
                    });


                    it('should parse CRLF as delimiter', function() {
                        // IE does use CRLF
                        expect(parseHeaders('a: b\r\nc: d\r\n')).toEqual({a: 'b', c: 'd'});
                        expect(parseHeaders('a: b\r\nc: d\r\n').a).toBe('b');
                    });


                    it('should parse tab after semi-colon', function() {
                        expect(parseHeaders('a:\tbb').a).toBe('bb');
                        expect(parseHeaders('a: \tbb').a).toBe('bb');
                    });
                });


                describe('request headers', function() {

                    it('should send custom headers', function() {
                        $sailsBackend.expect('GET', '/url', undefined, function(headers) {
                            return headers['Custom'] == 'header';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'GET', headers: {
                            'Custom': 'header'
                        }});

                        $sailsBackend.flush();
                    });


                    it('should set default headers for GET request', function() {
                        $sailsBackend.expect('GET', '/url', undefined, function(headers) {
                            return headers['Accept'] == 'application/json, text/plain, */*';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'GET', headers: {}});
                        $sailsBackend.flush();
                    });


                    it('should set default headers for POST request', function() {
                        $sailsBackend.expect('POST', '/url', 'messageBody', function(headers) {
                            return headers['Accept'] == 'application/json, text/plain, */*' &&
                            headers['Content-Type'] == 'application/json;charset=utf-8';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'POST', headers: {}, data: 'messageBody'});
                        $sailsBackend.flush();
                    });


                    it('should set default headers for PUT request', function() {
                        $sailsBackend.expect('PUT', '/url', 'messageBody', function(headers) {
                            return headers['Accept'] == 'application/json, text/plain, */*' &&
                            headers['Content-Type'] == 'application/json;charset=utf-8';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'PUT', headers: {}, data: 'messageBody'});
                        $sailsBackend.flush();
                    });

                    it('should set default headers for PATCH request', function() {
                        $sailsBackend.expect('PATCH', '/url', 'messageBody', function(headers) {
                            return headers['Accept'] == 'application/json, text/plain, */*' &&
                            headers['Content-Type'] == 'application/json;charset=utf-8';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'PATCH', headers: {}, data: 'messageBody'});
                        $sailsBackend.flush();
                    });

                    it('should set default headers for custom HTTP method', function() {
                        $sailsBackend.expect('FOO', '/url', undefined, function(headers) {
                            return headers['Accept'] == 'application/json, text/plain, */*';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'FOO', headers: {}});
                        $sailsBackend.flush();
                    });


                    it('should override default headers with custom', function() {
                        $sailsBackend.expect('POST', '/url', 'messageBody', function(headers) {
                            return headers['Accept'] == 'Rewritten' &&
                            headers['Content-Type'] == 'Rewritten';
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'POST', data: 'messageBody', headers: {
                            'Accept': 'Rewritten',
                            'Content-Type': 'Rewritten'
                        }});
                        $sailsBackend.flush();
                    });

                    //TODO wtf?

                    //   it('should delete default headers if custom header function returns null', function () {
                    //
                    //     $sailsBackend.expect('POST', '/url', 'messageBody', function(headers) {
                    //       return !('Accept' in headers);
                    //     }).respond('');
                    //
                    //     $sailsSocket({url: '/url', method: 'POST', data: 'messageBody', headers: {
                    //       'Accept': function() { return null; }
                    //     }});
                    //     $sailsBackend.flush();
                    //   });

                    it('should override default headers with custom in a case insensitive manner', function() {
                        $sailsBackend.expect('POST', '/url', 'messageBody', function(headers) {
                            return headers['accept'] == 'Rewritten' &&
                            headers['content-type'] == 'Content-Type Rewritten' &&
                            headers['Accept'] === undefined &&
                            headers['Content-Type'] === undefined;
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'POST', data: 'messageBody', headers: {
                            'accept': 'Rewritten',
                            'content-type': 'Content-Type Rewritten'
                        }});
                        $sailsBackend.flush();
                    });

                    it('should not set XSRF cookie for cross-domain requests', inject(function($browser) {
                        $browser.cookies('XSRF-TOKEN', 'secret');
                        $browser.url('http://host.com/base');
                        $sailsBackend.expect('GET', 'http://www.test.com/url', undefined, function(headers) {
                            return headers['X-XSRF-TOKEN'] === undefined;
                        }).respond('');

                        $sailsSocket({url: 'http://www.test.com/url', method: 'GET', headers: {}});
                        $sailsBackend.flush();
                    }));


                    it('should not send Content-Type header if request data/body is undefined', function() {
                        $sailsBackend.expect('POST', '/url', undefined, function(headers) {
                            return !headers.hasOwnProperty('Content-Type');
                        }).respond('');

                        $sailsBackend.expect('POST', '/url2', undefined, function(headers) {
                            return !headers.hasOwnProperty('content-type');
                        }).respond('');

                        $sailsSocket({url: '/url', method: 'POST'});
                        $sailsSocket({url: '/url2', method: 'POST', headers: {'content-type': 'Rewritten'}});
                        $sailsBackend.flush();
                    });

                    it('should NOT delete Content-Type header if request data/body is set by request transform', function() {
                        $sailsBackend.expect('POST', '/url', {'one' : 'two'}, function(headers) {
                            return headers['Content-Type'] == 'application/json;charset=utf-8';
                        }).respond('');

                        $sailsSocket({
                            url: '/url',
                            method: 'POST',
                            transformRequest : function(data) {
                                data = {'one' : 'two'};
                                return data;
                            }
                        });

                        $sailsBackend.flush();
                    });

                    it('should set the XSRF cookie into a XSRF header', inject(function($browser) {
                        function checkXSRF(secret, header) {
                            return function(headers) {
                                return headers[header || 'X-XSRF-TOKEN'] == secret;
                            };
                        }

                        $browser.cookies('XSRF-TOKEN', 'secret');
                        $browser.cookies('aCookie', 'secret2');
                        $sailsBackend.expect('GET', '/url', undefined, checkXSRF('secret')).respond('');
                        $sailsBackend.expect('POST', '/url', undefined, checkXSRF('secret')).respond('');
                        $sailsBackend.expect('PUT', '/url', undefined, checkXSRF('secret')).respond('');
                        $sailsBackend.expect('DELETE', '/url', undefined, checkXSRF('secret')).respond('');
                        $sailsBackend.expect('GET', '/url', undefined, checkXSRF('secret', 'aHeader')).respond('');
                        $sailsBackend.expect('GET', '/url', undefined, checkXSRF('secret2')).respond('');

                        $sailsSocket({url: '/url', method: 'GET'});
                        $sailsSocket({url: '/url', method: 'POST', headers: {'S-ome': 'Header'}});
                        $sailsSocket({url: '/url', method: 'PUT', headers: {'Another': 'Header'}});
                        $sailsSocket({url: '/url', method: 'DELETE', headers: {}});
                        $sailsSocket({url: '/url', method: 'GET', xsrfHeaderName: 'aHeader'});
                        $sailsSocket({url: '/url', method: 'GET', xsrfCookieName: 'aCookie'});

                        $sailsBackend.flush();
                    }));

                    it('should send execute result if header value is function', inject(function() {
                        var headerConfig = {'Accept': function() { return 'Rewritten'; }};

                        function checkHeaders(headers) {
                            return headers['Accept'] == 'Rewritten';
                        }

                        $sailsBackend.expect('GET', '/url', undefined, checkHeaders).respond('');
                        $sailsBackend.expect('POST', '/url', undefined, checkHeaders).respond('');
                        $sailsBackend.expect('PUT', '/url', undefined, checkHeaders).respond('');
                        $sailsBackend.expect('PATCH', '/url', undefined, checkHeaders).respond('');
                        $sailsBackend.expect('DELETE', '/url', undefined, checkHeaders).respond('');

                        $sailsSocket({url: '/url', method: 'GET', headers: headerConfig});
                        $sailsSocket({url: '/url', method: 'POST', headers: headerConfig});
                        $sailsSocket({url: '/url', method: 'PUT', headers: headerConfig});
                        $sailsSocket({url: '/url', method: 'PATCH', headers: headerConfig});
                        $sailsSocket({url: '/url', method: 'DELETE', headers: headerConfig});

                        $sailsBackend.flush();
                    }));

                    //TODO figure out xsrf stuff

                    //   it('should check the cache before checking the XSRF cookie', inject(function($browser, $cacheFactory) {
                    //     var testCache = $cacheFactory('testCache'),
                    //         executionOrder = [];
                    //
                    //     spyOn($browser, 'cookies').andCallFake(function() {
                    //       executionOrder.push('cookies');
                    //       return {'XSRF-TOKEN':'foo'};
                    //     });
                    //     spyOn(testCache, 'get').andCallFake(function() {
                    //       executionOrder.push('cache');
                    //     });
                    //
                    //     $sailsBackend.expect('GET', '/url', undefined).respond('');
                    //     $sailsSocket({url: '/url', method: 'GET', cache: testCache});
                    //     $sailsBackend.flush();
                    //
                    //     expect(executionOrder).toEqual(['cache', 'cookies']);
                    //   }));
                });


                describe('short methods', function() {

                    function checkHeader(name, value) {
                        return function(headers) {
                            return headers[name] == value;
                        };
                    }

                    it('should have get()', function() {
                        $sailsBackend.expect('GET', '/url').respond('');
                        $sailsSocket.get('/url');
                    });


                    it('get() should allow config param', function() {
                        $sailsBackend.expect('GET', '/url', undefined, checkHeader('Custom', 'Header')).respond('');
                        $sailsSocket.get('/url', {headers: {'Custom': 'Header'}});
                    });


                    it('should have delete()', function() {
                        $sailsBackend.expect('DELETE', '/url').respond('');
                        $sailsSocket['delete']('/url');
                    });


                    it('delete() should allow config param', function() {
                        $sailsBackend.expect('DELETE', '/url', undefined, checkHeader('Custom', 'Header')).respond('');
                        $sailsSocket['delete']('/url', {headers: {'Custom': 'Header'}});
                    });


                    it('should have head()', function() {
                        $sailsBackend.expect('HEAD', '/url').respond('');
                        $sailsSocket.head('/url');
                    });


                    it('head() should allow config param', function() {
                        $sailsBackend.expect('HEAD', '/url', undefined, checkHeader('Custom', 'Header')).respond('');
                        $sailsSocket.head('/url', {headers: {'Custom': 'Header'}});
                    });


                    it('should have post()', function() {
                        $sailsBackend.expect('POST', '/url', 'some-data').respond('');
                        $sailsSocket.post('/url', 'some-data');
                    });


                    it('post() should allow config param', function() {
                        $sailsBackend.expect('POST', '/url', 'some-data', checkHeader('Custom', 'Header')).respond('');
                        $sailsSocket.post('/url', 'some-data', {headers: {'Custom': 'Header'}});
                    });


                    it('should have put()', function() {
                        $sailsBackend.expect('PUT', '/url', 'some-data').respond('');
                        $sailsSocket.put('/url', 'some-data');
                    });


                    it('put() should allow config param', function() {
                        $sailsBackend.expect('PUT', '/url', 'some-data', checkHeader('Custom', 'Header')).respond('');
                        $sailsSocket.put('/url', 'some-data', {headers: {'Custom': 'Header'}});
                    });

                    //TODO patch/jsonp over sockets?

                    //   it('should have patch()', function(){
                    //     $sailsBackend.expect('PATCH', '/url', 'some-data').respond('');
                    //     $sailsSocket.patch('/url', 'some-data');
                    //   });
                    //
                    //   it('patch() should allow config param', function() {
                    //     $sailsBackend.expect('PATCH', '/url', 'some-data', checkHeader('Custom', 'Header')).respond('');
                    //     $sailsSocket.patch('/url', 'some-data', {headers: {'Custom': 'Header'}});
                    //   });
                    //
                    //   it('should have jsonp()', function() {
                    //     $sailsBackend.expect('JSONP', '/url').respond('');
                    //     $sailsSocket.jsonp('/url');
                    //   });
                    //
                    //
                    //   it('jsonp() should allow config param', function() {
                    //     $sailsBackend.expect('JSONP', '/url', undefined, checkHeader('Custom', 'Header')).respond('');
                    //     $sailsSocket.jsonp('/url', {headers: {'Custom': 'Header'}});
                    //   });
                });


                describe('scope.$apply', function() {

                    it('should $apply after success callback', function() {
                        $sailsBackend.when('GET').respond(200);
                        $sailsSocket({method: 'GET', url: '/some'});
                        $sailsBackend.flush();
                        expect($rootScope.$apply).toHaveBeenCalledOnce();
                    });


                    it('should $apply after error callback', function() {
                        $sailsBackend.when('GET').respond(404);
                        $sailsSocket({method: 'GET', url: '/some'});
                        $sailsBackend.flush();
                        expect($rootScope.$apply).toHaveBeenCalledOnce();
                    });


                    it('should $apply even if exception thrown during callback', inject(function($exceptionHandler){
                        $sailsBackend.when('GET').respond(200);
                        callback.andThrow('error in callback');

                        $sailsSocket({method: 'GET', url: '/some'}).then(callback);
                        $sailsBackend.flush();
                        expect($rootScope.$apply).toHaveBeenCalledOnce();

                        $exceptionHandler.errors = [];
                    }));
                });


                describe('transformData', function() {

                    describe('request', function() {

                        describe('default', function() {

                            it('should transform object into json', function() {
                                $sailsBackend.expect('POST', '/url', '{"one":"two"}').respond('');
                                $sailsSocket({method: 'POST', url: '/url', data: {one: 'two'}});
                            });


                            it('should ignore strings', function() {
                                $sailsBackend.expect('POST', '/url', 'string-data').respond('');
                                $sailsSocket({method: 'POST', url: '/url', data: 'string-data'});
                            });

                            //TODO less crappy tests, ugh.
                            //maybe integrate skipper;
                            //
                            // it('should ignore File objects', function() {
                            //     var file = {
                            //         some: true,
                            //         // $sailsBackend compares toJson values by default,
                            //         // we need to be sure it's not serialized into json string
                            //         test: function(actualValue) {
                            //             return this === actualValue;
                            //         }
                            //     };
                            //
                            //     // I'm really sorry for doing this :-D
                            //     // Unfortunatelly I don't know how to trick toString.apply(obj) comparison
                            //     /spyOn(window, 'isFile').andReturn(true);
                            //
                            //     $sailsBackend.expect('POST', '/some', file).respond('');
                            //     $sailsSocket({method: 'POST', url: '/some', data: file});
                            // });
                        });


                        // it('should ignore Blob objects', function () {
                        //     if (!window.Blob) return;
                        //
                        //         var blob = new Blob(['blob!'], { type: 'text/plain' });
                        //
                        //         $sailsBackend.expect('POST', '/url', '[object Blob]').respond('');
                        //         $sailsSocket({ method: 'POST', url: '/url', data: blob });
                        //     });


                            it('should have access to request headers', function() {
                                $sailsBackend.expect('POST', '/url', 'header1').respond(200);
                                $sailsSocket.post('/url', 'req', {
                                    headers: {h1: 'header1'},
                                    transformRequest: function(data, headers) {
                                        return headers('h1');
                                    }
                                }).success(callback);
                                $sailsBackend.flush();

                                expect(callback).toHaveBeenCalledOnce();
                            });


                            it('should pipeline more functions', function() {
                                function first(d, h) {return d + '-first' + ':' + h('h1');}
                                function second(d) {return uppercase(d);}

                                $sailsBackend.expect('POST', '/url', 'REQ-FIRST:V1').respond(200);
                                $sailsSocket.post('/url', 'req', {
                                    headers: {h1: 'v1'},
                                    transformRequest: [first, second]
                                }).success(callback);
                                $sailsBackend.flush();

                                expect(callback).toHaveBeenCalledOnce();
                            });
                        });


                        describe('response', function() {

                            describe('default', function() {

                                it('should deserialize json objects', function() {
                                    $sailsBackend.expect('GET', '/url').respond('{"foo":"bar","baz":23}');
                                    $sailsSocket({method: 'GET', url: '/url'}).success(callback);
                                    $sailsBackend.flush();

                                    expect(callback).toHaveBeenCalledOnce();
                                    expect(callback.mostRecentCall.args[0]).toEqual({foo: 'bar', baz: 23});
                                });


                                it('should deserialize json arrays', function() {
                                    $sailsBackend.expect('GET', '/url').respond('[1, "abc", {"foo":"bar"}]');
                                    $sailsSocket({method: 'GET', url: '/url'}).success(callback);
                                    $sailsBackend.flush();

                                    expect(callback).toHaveBeenCalledOnce();
                                    expect(callback.mostRecentCall.args[0]).toEqual([1, 'abc', {foo: 'bar'}]);
                                });


                                it('should deserialize json with security prefix', function() {
                                    $sailsBackend.expect('GET', '/url').respond(')]}\',\n[1, "abc", {"foo":"bar"}]');
                                    $sailsSocket({method: 'GET', url: '/url'}).success(callback);
                                    $sailsBackend.flush();

                                    expect(callback).toHaveBeenCalledOnce();
                                    expect(callback.mostRecentCall.args[0]).toEqual([1, 'abc', {foo:'bar'}]);
                                });


                                it('should deserialize json with security prefix ")]}\'"', function() {
                                    $sailsBackend.expect('GET', '/url').respond(')]}\'\n\n[1, "abc", {"foo":"bar"}]');
                                    $sailsSocket({method: 'GET', url: '/url'}).success(callback);
                                    $sailsBackend.flush();

                                    expect(callback).toHaveBeenCalledOnce();
                                    expect(callback.mostRecentCall.args[0]).toEqual([1, 'abc', {foo:'bar'}]);
                                });


                                it('should not deserialize tpl beginning with ng expression', function() {
                                    $sailsBackend.expect('GET', '/url').respond('{{some}}');
                                    $sailsSocket.get('/url').success(callback);
                                    $sailsBackend.flush();

                                    expect(callback).toHaveBeenCalledOnce();
                                    expect(callback.mostRecentCall.args[0]).toEqual('{{some}}');
                                });
                            });


                            it('should have access to response headers', function() {
                                $sailsBackend.expect('GET', '/url').respond(200, 'response', {h1: 'header1'});
                                $sailsSocket.get('/url', {
                                    transformResponse: function(data, headers) {
                                        return headers('h1');
                                    }
                                }).success(callback);
                                $sailsBackend.flush();

                                expect(callback).toHaveBeenCalledOnce();
                                expect(callback.mostRecentCall.args[0]).toBe('header1');
                            });


                            it('should pipeline more functions', function() {
                                function first(d, h) {return d + '-first' + ':' + h('h1');}
                                function second(d) {return uppercase(d);}

                                $sailsBackend.expect('POST', '/url').respond(200, 'resp', {h1: 'v1'});
                                $sailsSocket.post('/url', '', {transformResponse: [first, second]}).success(callback);
                                $sailsBackend.flush();

                                expect(callback).toHaveBeenCalledOnce();
                                expect(callback.mostRecentCall.args[0]).toBe('RESP-FIRST:V1');
                            });
                        });
                    });


                    describe('cache', function() {

                        var cache;

                        beforeEach(inject(function($cacheFactory) {
                            cache = $cacheFactory('testCache');
                        }));


                        function doFirstCacheRequest(method, respStatus, headers) {
                            $sailsBackend.expect(method || 'GET', '/url').respond(respStatus || 200, 'content', headers);
                            $sailsSocket({method: method || 'GET', url: '/url', cache: cache});
                            $sailsBackend.flush();
                        }


                        it('should cache GET request when cache is provided', inject(function($rootScope) {
                            doFirstCacheRequest();

                            $sailsSocket({method: 'get', url: '/url', cache: cache}).success(callback);
                            $rootScope.$digest();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content');
                        }));

                        it('should cache JSONP request when cache is provided', inject(function($rootScope) {
                            $sailsBackend.expect('JSONP', '/url?cb=JSON_CALLBACK').respond('content');
                            $sailsSocket({method: 'JSONP', url: '/url?cb=JSON_CALLBACK', cache: cache});
                            $sailsBackend.flush();

                            $sailsSocket({method: 'JSONP', url: '/url?cb=JSON_CALLBACK', cache: cache}).success(callback);
                            $rootScope.$digest();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content');
                        }));

                        it('should cache request when cache is provided and no method specified', function () {
                            doFirstCacheRequest();

                            $sailsSocket({url: '/url', cache: cache}).success(callback);
                            $rootScope.$digest();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content');
                        });


                        it('should not cache when cache is not provided', function() {
                            doFirstCacheRequest();

                            $sailsBackend.expect('GET', '/url').respond();
                            $sailsSocket({method: 'GET', url: '/url'});
                        });


                        it('should perform request when cache cleared', function() {
                            doFirstCacheRequest();

                            cache.removeAll();
                            $sailsBackend.expect('GET', '/url').respond();
                            $sailsSocket({method: 'GET', url: '/url', cache: cache});
                        });


                        it('should always call callback asynchronously', function() {
                            doFirstCacheRequest();
                            $sailsSocket({method: 'get', url: '/url', cache: cache}).then(callback);

                            expect(callback).not.toHaveBeenCalled();
                        });


                        it('should not cache POST request', function() {
                            doFirstCacheRequest('POST');

                            $sailsBackend.expect('POST', '/url').respond('content2');
                            $sailsSocket({method: 'POST', url: '/url', cache: cache}).success(callback);
                            $sailsBackend.flush();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content2');
                        });


                        it('should not cache PUT request', function() {
                            doFirstCacheRequest('PUT');

                            $sailsBackend.expect('PUT', '/url').respond('content2');
                            $sailsSocket({method: 'PUT', url: '/url', cache: cache}).success(callback);
                            $sailsBackend.flush();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content2');
                        });


                        it('should not cache DELETE request', function() {
                            doFirstCacheRequest('DELETE');

                            $sailsBackend.expect('DELETE', '/url').respond(206);
                            $sailsSocket({method: 'DELETE', url: '/url', cache: cache}).success(callback);
                            $sailsBackend.flush();

                            expect(callback).toHaveBeenCalledOnce();
                        });


                        it('should not cache non 2xx responses', function() {
                            doFirstCacheRequest('GET', 404);

                            $sailsBackend.expect('GET', '/url').respond('content2');
                            $sailsSocket({method: 'GET', url: '/url', cache: cache}).success(callback);
                            $sailsBackend.flush();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content2');
                        });


                        it('should cache the headers as well', inject(function($rootScope) {
                            doFirstCacheRequest('GET', 200, {'content-encoding': 'gzip', 'server': 'Apache'});
                            callback.andCallFake(function(r, s, headers) {
                                expect(headers()).toEqual({'content-encoding': 'gzip', 'server': 'Apache'});
                                expect(headers('server')).toBe('Apache');
                            });

                            $sailsSocket({method: 'GET', url: '/url', cache: cache}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                        }));


                        it('should not share the cached headers object instance', inject(function($rootScope) {
                            doFirstCacheRequest('GET', 200, {'content-encoding': 'gzip', 'server': 'Apache'});
                            callback.andCallFake(function(r, s, headers) {
                                expect(headers()).toEqual(cache.get('/url')[2]);
                                expect(headers()).not.toBe(cache.get('/url')[2]);
                            });

                            $sailsSocket({method: 'GET', url: '/url', cache: cache}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                        }));


                        it('should cache status code as well', inject(function($rootScope) {
                            doFirstCacheRequest('GET', 201);
                            callback.andCallFake(function(r, status, h) {
                                expect(status).toBe(201);
                            });

                            $sailsSocket({method: 'get', url: '/url', cache: cache}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                        }));


                        it('should use cache even if second request was made before the first returned', function() {
                            $sailsBackend.expect('GET', '/url').respond(201, 'fake-response');

                            callback.andCallFake(function(response, status, headers) {
                                expect(response).toBe('fake-response');
                                expect(status).toBe(201);
                            });

                            $sailsSocket({method: 'GET', url: '/url', cache: cache}).success(callback);
                            $sailsSocket({method: 'GET', url: '/url', cache: cache}).success(callback);

                            $sailsBackend.flush();
                            expect(callback).toHaveBeenCalled();
                            expect(callback.callCount).toBe(2);
                        });


                        it('should allow the cached value to be an empty string', function () {
                            cache.put('/abc', '');

                            callback.andCallFake(function (response, status, headers) {
                                expect(response).toBe('');
                                expect(status).toBe(200);
                            });

                            $sailsSocket({method: 'GET', url: '/abc', cache: cache}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalled();
                        });


                        it('should default to status code 200 and empty headers if cache contains a non-array element',
                        inject(function($rootScope) {
                            cache.put('/myurl', 'simple response');
                            $sailsSocket.get('/myurl', {cache: cache}).success(function(data, status, headers) {
                                expect(data).toBe('simple response');
                                expect(status).toBe(200);
                                expect(headers()).toEqual({});
                                callback();
                            });

                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                        })
                    );

                    describe('$sailsSocket.defaults.cache', function () {

                        it('should be undefined by default', function() {
                            expect($sailsSocket.defaults.cache).toBeUndefined();
                        });

                        it('should cache requests when no cache given in request config', function() {
                            $sailsSocket.defaults.cache = cache;

                            // First request fills the cache from server response.
                            $sailsBackend.expect('GET', '/url').respond(200, 'content');
                            $sailsSocket({method: 'GET', url: '/url'}); // Notice no cache given in config.
                            $sailsBackend.flush();

                            // Second should be served from cache, without sending request to server.
                            $sailsSocket({method: 'get', url: '/url'}).success(callback);
                            $rootScope.$digest();

                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content');

                            // Invalidate cache entry.
                            $sailsSocket.defaults.cache.remove("/url");

                            // After cache entry removed, a request should be sent to server.
                            $sailsBackend.expect('GET', '/url').respond(200, 'content');
                            $sailsSocket({method: 'GET', url: '/url'});
                            $sailsBackend.flush();
                        });

                        it('should have less priority than explicitly given cache', inject(function($cacheFactory) {
                            var localCache = $cacheFactory('localCache');
                            $sailsSocket.defaults.cache = cache;

                            // Fill local cache.
                            $sailsBackend.expect('GET', '/url').respond(200, 'content-local-cache');
                            $sailsSocket({method: 'GET', url: '/url', cache: localCache});
                            $sailsBackend.flush();

                            // Fill default cache.
                            $sailsBackend.expect('GET', '/url').respond(200, 'content-default-cache');
                            $sailsSocket({method: 'GET', url: '/url'});
                            $sailsBackend.flush();

                            // Serve request from default cache when no local given.
                            $sailsSocket({method: 'get', url: '/url'}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content-default-cache');
                            callback.reset();

                            // Serve request from local cache when it is given (but default filled too).
                            $sailsSocket({method: 'get', url: '/url', cache: localCache}).success(callback);
                            $rootScope.$digest();
                            expect(callback).toHaveBeenCalledOnce();
                            expect(callback.mostRecentCall.args[0]).toBe('content-local-cache');
                        }));

                        it('should be skipped if {cache: false} is passed in request config', function() {
                            $sailsSocket.defaults.cache = cache;

                            $sailsBackend.expect('GET', '/url').respond(200, 'content');
                            $sailsSocket({method: 'GET', url: '/url'});
                            $sailsBackend.flush();

                            $sailsBackend.expect('GET', '/url').respond();
                            $sailsSocket({method: 'GET', url: '/url', cache: false});
                            $sailsBackend.flush();
                        });
                    });
                });


                describe('timeout', function() {

                    it('should abort requests when timeout promise resolves', inject(function($q) {
                        var canceler = $q.defer();

                        $sailsBackend.expect('GET', '/some').respond(200);

                        $sailsSocket({method: 'GET', url: '/some', timeout: canceler.promise}).error(
                            function(data, status, headers, config) {
                                expect(data).toBeUndefined();
                                expect(status).toBe(0);
                                expect(headers()).toEqual({});
                                expect(config.url).toBe('/some');
                                callback();
                            });

                            $rootScope.$apply(function() {
                                canceler.resolve();
                            });

                            expect(callback).toHaveBeenCalled();
                            $sailsBackend.verifyNoOutstandingExpectation();
                            $sailsBackend.verifyNoOutstandingRequest();
                        }));


                        it('should reject promise when timeout promise resolves', inject(function($timeout) {
                            var onFulfilled = jasmine.createSpy('onFulfilled');
                            var onRejected = jasmine.createSpy('onRejected');
                            $sailsBackend.expect('GET', '/some').respond(200);

                            $sailsSocket({method: 'GET', url: '/some', timeout: $timeout(angular.noop, 10)}).then(onFulfilled, onRejected);

                            $timeout.flush(100);

                            expect(onFulfilled).not.toHaveBeenCalled();
                            expect(onRejected).toHaveBeenCalledOnce();
                        }));
                    });


                    describe('pendingRequests', function() {

                        it('should be an array of pending requests', function() {
                            $sailsBackend.when('GET').respond(200);
                            expect($sailsSocket.pendingRequests.length).toBe(0);

                            $sailsSocket({method: 'get', url: '/some'});
                            $rootScope.$digest();
                            expect($sailsSocket.pendingRequests.length).toBe(1);

                            $sailsBackend.flush();
                            expect($sailsSocket.pendingRequests.length).toBe(0);
                        });


                        it('should update pending requests even when served from cache', inject(function($rootScope) {
                            $sailsBackend.when('GET').respond(200);

                            $sailsSocket({method: 'get', url: '/cached', cache: true});
                            $sailsSocket({method: 'get', url: '/cached', cache: true});
                            $rootScope.$digest();
                            expect($sailsSocket.pendingRequests.length).toBe(2);

                            $sailsBackend.flush();
                            expect($sailsSocket.pendingRequests.length).toBe(0);

                            $sailsSocket({method: 'get', url: '/cached', cache: true});
                            spyOn($sailsSocket.pendingRequests, 'push').andCallThrough();
                            $rootScope.$digest();
                            expect($sailsSocket.pendingRequests.push).toHaveBeenCalledOnce();

                            $rootScope.$apply();
                            expect($sailsSocket.pendingRequests.length).toBe(0);
                        }));


                        it('should remove the request before firing callbacks', function() {
                            $sailsBackend.when('GET').respond(200);
                            $sailsSocket({method: 'get', url: '/url'}).success(function() {
                                expect($sailsSocket.pendingRequests.length).toBe(0);
                            });

                            $rootScope.$digest();
                            expect($sailsSocket.pendingRequests.length).toBe(1);
                            $sailsBackend.flush();
                        });
                    });


                    describe('defaults', function() {

                        it('should expose the defaults object at runtime', function() {
                            expect($sailsSocket.defaults).toBeDefined();

                            $sailsSocket.defaults.headers.common.foo = 'bar';
                            $sailsBackend.expect('GET', '/url', undefined, function(headers) {
                                return headers['foo'] == 'bar';
                            }).respond('');

                            $sailsSocket.get('/url');
                            $sailsBackend.flush();
                        });

                        it('should have separate opbjects for defaults PUT and POST', function() {
                            expect($sailsSocket.defaults.headers.post).not.toBe($sailsSocket.defaults.headers.put);
                            expect($sailsSocket.defaults.headers.post).not.toBe($sailsSocket.defaults.headers.patch);
                            expect($sailsSocket.defaults.headers.put).not.toBe($sailsSocket.defaults.headers.patch);
                        });
                    });
                });


                it('should pass timeout, withCredentials and responseType', function() {
                    var $sailsBackend = jasmine.createSpy('$sailsBackend');

                    $sailsBackend.andCallFake(function(m, u, d, c, h, timeout, withCredentials, responseType) {
                        expect(timeout).toBe(12345);
                        expect(withCredentials).toBe(true);
                        expect(responseType).toBe('json');
                    });

                    module(function($provide) {
                        $provide.value('$sailsBackend', $sailsBackend);
                    });

                    inject(function($sailsSocket, $rootScope) {
                        $sailsSocket({
                            method: 'GET',
                            url: 'some.html',
                            timeout: 12345,
                            withCredentials: true,
                            responseType: 'json'
                        });
                        $rootScope.$digest();
                        expect($sailsBackend).toHaveBeenCalledOnce();
                    });

                    $sailsBackend.verifyNoOutstandingExpectation = angular.noop;
                });


                it('should use withCredentials from default', function() {
                    var $sailsBackend = jasmine.createSpy('$sailsBackend');

                    $sailsBackend.andCallFake(function(m, u, d, c, h, timeout, withCredentials, responseType) {
                        expect(withCredentials).toBe(true);
                    });

                    module(function($provide) {
                        $provide.value('$sailsBackend', $sailsBackend);
                    });

                    inject(function($sailsSocket, $rootScope) {
                        $sailsSocket.defaults.withCredentials = true;
                        $sailsSocket({
                            method: 'GET',
                            url: 'some.html',
                            timeout: 12345,
                            responseType: 'json'
                        });
                        $rootScope.$digest();
                        expect($sailsBackend).toHaveBeenCalledOnce();
                    });

                    $sailsBackend.verifyNoOutstandingExpectation = angular.noop;
                });
            });
